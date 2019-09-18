import UserModel from "./user.model";
import UserRole from "./user-role"

import StringHelper from "modules/helpers/string-helper";
import client from "modules/DB/redis"

export default class User extends UserModel {

    isUserOwner(object){

        const user = this;

        if (!user) return false;

        if (user.role === UserRole.SYS_ADMIN) return true;
        if (user.role === UserRole.MODERATOR) return true;

        return object.owner === user.username;

    }

    async saveScore(){
        //saving a hset to enable login from emails
        await client.hsetAsync(this._table+"s:emails",  this.email, this.username );
    }

    async deleteScore(){
        await client.hdelAsync(this._table+"s:emails",  this.email );
    }

}