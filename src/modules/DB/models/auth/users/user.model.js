import Model from "modules/DB/model"
import client from "modules/DB/redis"

export default class UserModel extends Model {

    constructor( username, email, salt, password, country, date ){

        super( "user", ["username","email", 'salt', "password", "country", "date" ] );

        this.username = username;
        this.email = email;
        this.salt = salt;
        this.password = password;
        this.country = country;

        this.date = date;
    }

    get id(){
        return this.username;
    }


}