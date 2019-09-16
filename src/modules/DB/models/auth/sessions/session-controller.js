import Controller from "../../../controller";
import Session from "./session.model"
import StringHelper from "modules/helpers/string-helper";

import client from "modules/DB/redis"

class SessionController extends Controller {

    constructor() {
        super('sessions');
    }

    async createModel({username, date}){

        if (!username) throw "Username must be specified";

        if (!date) date = new Date().getTime() + 157784760000;

        let key, session;

        while (1) {

            key = StringHelper.makeSalt(40);

            session = new Session(key, username, new Date().getTime(), date, new Date().getTime());
            if ( await session.exists() === false )
                break;
        }

        await session.save();

        return session;

    }

}

export default new SessionController();