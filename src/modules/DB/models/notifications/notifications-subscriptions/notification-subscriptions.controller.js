import Controller from "../../../controller";
import NotificationSubscription from "./notification-subscription"
import CryptoHelper from "modules/helpers/crypto-helper"
import webPush from 'web-push';
import constsSecret from "consts/consts-secret"
import client from "modules/DB/redis"

class NotificationSubscriptionsController extends  Controller{

    constructor(){

        super("subscription", NotificationSubscription);

        webPush.setVapidDetails( constsSecret.vapid.email, constsSecret.vapid.publicKey, constsSecret.vapid.privateKey);
    }

    async createNotificationSubscription( {subscription}, {publicKey, auth}){

        const who = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

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

    async pushNotification( {who, payload = {title: 'Title',  body: "Body", } }, {publicKey, auth} ){

        if (!who) who = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        const subscriptions = await this.loadAll(undefined, who );

        payload = JSON.stringify(payload );

        const promises = subscriptions.map( model => webPush.sendNotification( model.subscription, payload) );

        const results =  await Promise.all(promises.map(p => p.catch(e => e)));

        const updates = await Promise.all( results.map ( (it, index) => {

            if (it instanceof Error ){
                console.error("Error pushing notification", it);
                subscriptions[index].errors += 1;
                return subscriptions.save();
            } else {

            }

        }));

    }

}

export default new NotificationSubscriptionsController();