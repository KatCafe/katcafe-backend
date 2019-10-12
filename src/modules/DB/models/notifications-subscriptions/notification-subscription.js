import NotificationSubscriptionModel from "./notification-subscription.model"

export default class NotificationSubscription extends NotificationSubscriptionModel {

    constructor( id, who, subscription, date = new Date().getTime() ){
        super(id, who, subscription, date);
    }

}