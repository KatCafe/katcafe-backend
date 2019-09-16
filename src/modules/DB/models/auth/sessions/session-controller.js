import Controller from "../../../controller";
import Session from "./session.model"
import StringHelper from "modules/helpers/string-helper";

import client from "modules/DB/redis"

class SessionController extends Controller {

    constructor() {
        super('sessions');
    }

    async createSessionModel({userSlug, date}){

        if (!userSlug) throw "Username must be specified";

        if (!date) date = new Date().getTime() + 2592000000;

        let key, session;

        while (1) {

            key = StringHelper.makeSalt(70);

            session = new Session( key, userSlug, new Date().getTime(), date, new Date().getTime() );

            if ( await session.exists() === false )
                break;
        }

        await session.save();

        return session;

    }


    async loginModelSession( key, loginFirst = false ){

        const session = new Session(key);

        if (await session.load() === false)
            throw "Session not found";

        if (session.expirationDate > new Date().getTime()) {
            await session.delete();
            throw "Session was expired";
        }

        if (loginFirst) {
            session.lastUseDate = new Date().getTime();
            await session.save();
        }

        const user = new User(session.slug)

        return {
            user,
            session,
        }

    }

}

export default new SessionController();