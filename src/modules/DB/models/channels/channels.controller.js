import Controller from "../../controller";
import Channel from "./channel";

import StringHelper from "modules/helpers/string-helper";
import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import Flags from "modules/helpers/flags";

class ChannelsController extends Controller{

    constructor(){
        super("channels");
    }

    async createModel( {name, title, icon, cover, country, captcha} ){

        name = StringHelper.removeWhiteSpace(name);
        title = StringHelper.removeWhiteSpace(title);
        icon = StringHelper.removeWhiteSpace(icon);
        cover = StringHelper.removeWhiteSpace(cover);
        country = (StringHelper.removeWhiteSpace(country)||'us').toLowerCase();

        if (name.length < 1) throw "Name is to small. Required at least 1 char";
        if (name.length === 2) throw "2 letters are reserved for countries";

        if (title.length < 5) throw "Title is too small. Required at least 5 char";
        if (country.length === 0) throw "Country Code is required";

        if (!Flags.getLabelByCode(country)) throw "Country is invalid";

        await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        const slug = (country !== 'us' ? country +'/' : '') + StringHelper.url_slug( name );

        const channel = new Channel(slug, name, title, icon, cover, country, new Date().getTime() );

        return super.createModel(channel);

    }

    async getByRank(revert , searchAlgorithm , searchQuery, search, index, count, load){

        return super.getByRank.call(this,  Channel, revert, searchAlgorithm, searchQuery, search, index, count, load );

    }

}

export default new ChannelsController();