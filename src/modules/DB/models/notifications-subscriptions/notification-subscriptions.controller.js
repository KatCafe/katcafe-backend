import Controller from "../../controller";
import NotificationSubscription from "./notification-subscription"
import CryptoHelper from "src/modules/helpers/crypto-helper"

const webPush = require('web-push');

import constsSecret from "consts/consts-secret"
import client from "modules/DB/redis"

class NotificationSubscriptions extends  Controller{

    constructor(){

        super("notSub", NotificationSubscription);

        webPush.setVapidDetails( constsSecret.vapid.email, constsSecret.vapid.publicKey, constsSecret.vapid.privateKey);
    }

    async createNotificationSubscription(who, subscription){

        const data = {
            who,
            subscription,
        };

        const id = CryptoHelper.md5( JSON.stringify(data), undefined).toString("base64");

        const notificationSubscription = new NotificationSubscription(id, who, subscription);

        if (await notificationSubscription.load())
            return false;

        return notificationSubscription.save();

    }

}

export default new NotificationSubscriptions();