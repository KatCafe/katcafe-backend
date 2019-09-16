import UserModel from "./user.model";
import UserRole from "./user-role"

import StringHelper from "modules/helpers/string-helper";

export default class User extends UserModel {

    isUserOwner(object){

        const user = this;

        if (!user) return false;

        if (user.role === UserRole.SYS_ADMIN) return true;
        if (user.role === UserRole.MODERATOR) return true;

        return object.owner === user.username;

    }

}