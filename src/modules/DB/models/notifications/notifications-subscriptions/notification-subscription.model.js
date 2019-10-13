import Model from 'modules/DB/model'
import client from "../../../redis";

export default class NotificationSubscriptionModel extends Model {

    constructor( uuid, subscriber, subscription, errors, date ){

        super( 'subscription', ['uuid', 'subscriber', 'subscription', 'errors', 'date'],
            [ ] );

        this.uuid = uuid;
        this.subscriber = subscriber;
        this.subscription = subscription;
        this.date = date;
        this.errors = errors;

    }

    get id(){
        return this.uuid.toLowerCase();
    }



    async saveScore() {
        await client.saddAsync(this._table + "s:"+this.subscriber+":list", this.id);
    }

    async deleteScore() {
        client.sremAsync(this._table + "s:"+this.subscriber+":list", this.id);
    }

}