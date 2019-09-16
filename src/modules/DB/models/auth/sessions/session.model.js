import Model from "modules/DB/model"
import client from "modules/DB/redis"

export default class SessionModel extends Model {

    constructor( key, userSlug, date, expirationDate, lastUseDate){

        super( "session", [ 'key', 'userSlug', "date", 'expirationDate', 'lastUseDate' ] );

        this.key = key;
        this.userSlug = userSlug;
        this.date = date;
        this.expirationDate = expirationDate;
        this.lastUseDate = lastUseDate;

    }

    get id(){
        return this.key;
    }


}