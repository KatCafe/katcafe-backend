import Model from "modules/DB/model"
import client from "../../redis";

export default class UserModel extends Model {

    constructor( slug, username, email, password, date ){

        super( "channel", ["slug", "username","email","password", "date" ],
            [ "topics" ]);

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

    async load(){

        const promises = [
            Model.prototype.load.call(this),
        ];
        const out = await Promise.all(promises);

        this.topics = out[1] || 0;

    }

}