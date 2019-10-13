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
        return this.subscriber.toLowerCase()+':'+this.uuid.toLowerCase();
    }

}