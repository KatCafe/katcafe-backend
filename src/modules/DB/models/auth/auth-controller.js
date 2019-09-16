import Controller from "../../controller";
import User from "./users/user";
import StringHelper from "modules/helpers/string-helper";
import CaptchaController from "../captcha/captcha-controller";
import saltedMd5 from 'salted-md5';

import client from "modules/DB/redis"
import SessionController from "./sessions/session-controller"
import Session from "./sessions/session.model"

class AuthController extends Controller{

    constructor(){
        super('users');
    }

    async createUserModel( {username = '', email = '', password = '', confirmPassword='', country = '', captcha} ){

        username = StringHelper.removeWhiteSpace(username);
        email = StringHelper.removeWhiteSpace(email);
        password = StringHelper.removeWhiteSpace(password);
        country = StringHelper.removeWhiteSpace(country);

        if (!username || username.length < 3) throw "username is invalid. Requires at least 4 letters";
        if (StringHelper.url_slug( username ) !== username) throw "Username contains illegal characters";

        if (!email || email.length < 5) throw "Email is too small. Requires at least 3 char";
        if (!this._validateEmail(email)) throw "Email invalid";

        if (!password || password.length < 5) throw "Password too simple";
        if ( confirmPassword !== password) throw "Passwords don't match";

        if (!country || country.length === 0) throw "Country Code is required";

        country = country.toLowerCase();
        if (!country) country = 'us';

        await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;


        const salt = StringHelper.makeSalt();

        const passwordSalted = saltedMd5(password, salt);

        const user = new User( username, email, salt, passwordSalted, country, new Date().getTime() );

        //saving a hset to enable login from emails
        await client.hsetAsync(this.table+":emails",  email, username );

        return super.createModel(user);

    }

    async loginModel({ userEmail, password, captcha}, askCaptcha = false){

        const out = await client.hgetAsync(this.table+":emails", userEmail);
        if (out)
            userEmail = out;

        const user = new User(userEmail);

        if (askCaptcha)
            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        if ( await user.load() === false)
            throw "The user doesn't exist";

        const passwordSalted = saltedMd5(password, user.salt);

        if (user.password !== passwordSalted)
            throw "Password doesn't match";

        const session = await SessionController.createSessionModel({username: user.username});

        return {
            user,
            session,
        };

    }


    _validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

}

export default new AuthController();