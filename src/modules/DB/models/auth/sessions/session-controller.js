import Session from "./session.model"
import StringHelper from "modules/helpers/string-helper";
import User from "modules/DB/models/auth/users/user"

import client from "modules/DB/redis"

class SessionController {


    async createSessionModel({username, date}){

        if (!username) throw "Username must be specified";

        if (!date) date = new Date().getTime() + 2592000000;

        let key, session;

        while (1) {

            key = StringHelper.makeSalt(70);

            session = new Session( key, username, new Date().getTime(), date, new Date().getTime() );

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

        if (session.expirationDate < new Date().getTime()) {
            await session.delete();
            throw "Session was expired";
        }

        if (loginFirst) {
            session.lastUseDate = new Date().getTime();
            await session.save();
        }

        const user = new User(session.username);
        if (await user.load() === false) {
            await session.delete();
            throw "User was not found by username";
        }

        return {
            user,
            session,
        }

    }

    async logoutSession( key ) {

        const session = new Session(key);

        if (await session.load() === false)
            throw "Session not found";

        await session.delete();

        return true;

    }

}

export default new SessionController();