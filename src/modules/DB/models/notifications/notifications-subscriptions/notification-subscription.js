import NotificationSubscriptionModel from "./notification-subscription.model"

export default class NotificationSubscription extends NotificationSubscriptionModel {

    constructor( id, subscriber, subscription, trials = 0, date = new Date().getTime() ){
        super(id, subscriber, subscription, trials, date);
    }

}