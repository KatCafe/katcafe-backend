import Model from 'modules/DB/model'
import client from "../../redis";

export default class NotificationSubscriptionModel extends Model {

    constructor( uuid, who, subscription, date ){

        super( 'notSub', ['uuid', 'who', 'subscription', 'date'],
            [ ] );

        this.uuid = uuid;
        this.who = who;
        this.subscription = subscription;
        this.date = date;

    }

    get id(){
        return this.uuid.toLowerCase();
    }



    async saveScore() {
        await client.saddAsync(this._table + "s:"+this.who+":list", this.id);
    }

    async deleteScore() {
        client.sremAsync(this._table + "s:"+this.who+":list", this.id);
    }

}