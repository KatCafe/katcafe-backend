import Model from "modules/DB/model"
import client from "../../redis";

export default class UserModel extends Model {

    constructor( slug, username, email, password, date ){

        super( "user", ["slug", "username","email","password", "date" ] );

        this.slug = slug;

        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;

        this.date = date;
    }

    get id(){
        return this.slug;
    }


}