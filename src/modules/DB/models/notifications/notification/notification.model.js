import Model from 'modules/DB/model'
import client from "../../../redis";

export default class NotificationModel extends Model {

    constructor( uuid, subscriber, data, count, unread, date ){

        super( 'notification', ['uuid', 'subscriber', 'data', 'count', 'unread', 'date'],
            [ ] );

        this.uuid = uuid;
        this.subscriber = subscriber;
        this.data = data;
        this.count = count;
        this.unread = unread;
        this.date = date;

    }

    get id(){
        return (this.subscriber ? this.subscriber.toLowerCase()+':' : '') + this.uuid ? this.uuid.toLowerCase() : '';
    }

    async saveScore() {
        await client.zaddAsync(this._table + "s:rank:"+this.subscriber+":list", this.date, this.id);
    }

    async deleteScore() {
        client.zremAsync(this._table + "s:rank:"+this.subscriber+":list", this.id);
    }


}