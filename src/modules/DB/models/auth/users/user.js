import UserModel from "./user.model";
import UserRole from "./user-role"

import StringHelper from "modules/helpers/string-helper";
import client from "modules/DB/redis"

export default class User extends UserModel {

    isUserOwner(objects, type = 'moderation'){

        const user = this;

        if (!user) return false;

        if (user.role === UserRole.SYS_ADMIN) return true;
        if (type === 'moderation' && user.role === UserRole.MODERATOR) return true;

        if (!objects) return false;

        if (!Array.isArray(objects)) objects = [];

        return objects.reduce(  ( val, it) => val || ( it && it.owner === user.username) , false );

    }

    async saveScore(){
        //saving a hset to enable login from emails
        await client.hsetAsync(this._table+"s:emails",  this.email, this.username );
    }

    async deleteScore(){
        await client.hdelAsync(this._table+"s:emails",  this.email );
    }

}