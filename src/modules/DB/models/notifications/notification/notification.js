import NotificationModel from "./notification.model";

export default class Notification extends NotificationModel{

    constructor( uuid, subscriber, data, count = 1, unread = false, date = new Date().getTime() ){
        super(uuid, subscriber, data, count, unread, date)
    }

}