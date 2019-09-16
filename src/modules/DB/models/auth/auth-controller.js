import Controller from "../../controller";
import User from "./user";
import StringHelper from "../../../helpers/string-helper";
import CaptchaController from "../captcha/captcha-controller";

class AuthController extends Controller{

    constructor(){
        super('users');
    }

    async createModel( {username = '', email = '', password = '', country = '', captcha} ){

        username = StringHelper.removeWhiteSpace(username);
        email = StringHelper.removeWhiteSpace(email);
        password = StringHelper.removeWhiteSpace(password);
        country = StringHelper.removeWhiteSpace(country);

        if (!username || username.length < 4) throw "username is invalid. Required it requires at least 5 letters";
        if (StringHelper.url_slug( username ) !== username) throw "Username";

        if (!email || email.length < 5) throw "Title is too small. Required at least 5 char";
        if (!this._validateEmail(email)) throw "Email invalid";

        if (!password || password.length < 5) throw "Password too simple";

        if (!country || country.length === 0) throw "Country Code is required";

        country = country.toLowerCase();
        if (!country) country = 'us';

        await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        const slug = username;

        const user = new User(slug, username, email, password, country, new Date().getTime() );

        return super.createModel(user);

    }

    _validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

}

export default new AuthController();