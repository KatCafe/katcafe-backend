import UserModel from "./user.model";
import StringHelper from "modules/helpers/string-helper";

export default class User extends UserModel {

    constructor( slug, username, email, password, country, date ){

        super( slug, username, email, password, country, date,  );

    }


}