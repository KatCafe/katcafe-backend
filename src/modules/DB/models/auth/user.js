import UserModel from "./user.model";
import StringHelper from "modules/helpers/string-helper";

export default class User extends UserModel {

    constructor( username, email, password, date ){

        super( StringHelper.removeWhiteSpace(username), StringHelper.removeWhiteSpace(username), StringHelper.removeWhiteSpace(email), password, date,  );

    }


}