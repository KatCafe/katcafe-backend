import Model from "modules/DB/model"
import client from "modules/DB/redis"

export default class SessionModel extends Model {

    constructor( key, username, date, expirationDate, lastUseDate){

        super( "session", [ 'key', 'username', "date", 'expirationDate', 'lastUseDate' ] );

        this.key = key;
        this.username = username;
        this.date = date;
        this.expirationDate = expirationDate;
        this.lastUseDate = lastUseDate;

    }

    get id(){
        return this.key;
    }


}