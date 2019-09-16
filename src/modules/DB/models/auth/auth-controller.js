import Controller from "../../controller";
import User from "./user";
import StringHelper from "../../../helpers/string-helper";
import CaptchaController from "../captcha/captcha-controller";

import client from "modules/DB/redis"

class AuthController extends Controller{

    constructor(){
        super('users');
    }

    async createModel( {username = '', email = '', password = '', confirmPassword='', country = '', captcha} ){

        username = StringHelper.removeWhiteSpace(username);
        email = StringHelper.removeWhiteSpace(email);
        password = StringHelper.removeWhiteSpace(password);
        country = StringHelper.removeWhiteSpace(country);

        if (!username || username.length < 3) throw "username is invalid. Requires at least 4 letters";
        if (StringHelper.url_slug( username ) !== username) throw "Username contains illegal characters";
        const slug = username;

        if (!email || email.length < 5) throw "Email is too small. Requires at least 3 char";
        if (!this._validateEmail(email)) throw "Email invalid";

        if (!password || password.length < 5) throw "Password too simple";
        if ( confirmPassword !== password) throw "Passwords don't match";

        if (!country || country.length === 0) throw "Country Code is required";

        country = country.toLowerCase();
        if (!country) country = 'us';

        await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        const user = new User(slug, username, email, password, country, new Date().getTime() );

        //saving a hset to enable login from emails
        await client.hsetAsync(this.table+":emails",  email, slug );

        return super.createModel(user);

    }

    async loginModel({ userEmail, password, captcha}){

        const out = await client.hgetAsync(this.table+":emails", userEmail);
        if (out)
            userEmail = out;

        const user = User(userEmail);

        if ( await user.load() === false)
            throw "The user doesn't exist";

        if (user.password !== password)
            throw "Password doesn't match";

        return user;

    }

    _validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

}

export default new AuthController();