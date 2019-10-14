import Controller from "../../controller";
import Channel from "./channel";

import StringHelper from "modules/helpers/string-helper";

import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import SessionController from "modules/DB/models/auth/sessions/session-controller"

import Flags from "modules/helpers/flags";

class ChannelsController extends Controller{

    constructor(){
        super("channel", Channel );
    }

    async createModel( { name, title, icon, cover, country, captcha}, {auth, ipAddress} ){

        if (!auth) throw "You need to be logged in";

        name = StringHelper.sanitizeText(name);
        title = StringHelper.sanitizeText(title);
        icon = StringHelper.sanitizeText(icon);
        cover = StringHelper.sanitizeText(cover);
        country = (StringHelper.sanitizeText(country)||'us').toLowerCase();

        if (name.length < 1) throw "Name is to small. Required at least 1 char";

        if (title.length < 5) throw "Title is too small. Required at least 5 char";
        if (country.length === 0) throw "Country Code is required";

        if (!Flags.getLabelByCode(country)) throw "Country is invalid";

        if (country === 'us')
            if (name.length === 2) throw "2 letters are reserved for countries";

        const slug = (country !== 'us' ? country +'/' : '') + StringHelper.url_slug( name );
        if (slug === 'u') throw "Slug u is being reserved for users";

        await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        const channel = new Channel( slug, name, title, icon, cover, auth.username, country, ipAddress, new Date().getTime() );

        return super.createModel(channel);

    }

}

export default new ChannelsController();