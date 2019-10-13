import NotificationSubscriptionModel from "./notification-subscription.model"

export default class NotificationSubscription extends NotificationSubscriptionModel {

    constructor( id, who, subscription, trials = 0, date = new Date().getTime() ){
        super(id, who, subscription, trials, date);
    }

}