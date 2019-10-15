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

        const subscriber = CryptoHelper.md5(auth ? auth.username : publicKey ).toString("base64");
        const data = { subscriber,  subscription, };
        const id = CryptoHelper.md5( JSON.stringify(data), undefined).toString("base64");

        const notificationSubscription = new NotificationSubscription(id, subscriber, subscription);

        if (await notificationSubscription.load())
            return false;

        return notificationSubscription.save();

    }

    async deleteNotificationSubscription({subscription}, {publicKey, auth}){

        const subscriber = CryptoHelper.md5(auth ? auth.username : publicKey ).toString("base64");
        const data = { subscriber,  subscription, };
        const id = CryptoHelper.md5( JSON.stringify(data), undefined).toString("base64");

        const notificationSubscription = new NotificationSubscription(id, subscriber, subscription);

        return notificationSubscription.delete();

    }

    async pushNotification( {subscriber, payload = {title: 'Title',  body: "Body", } }, {publicKey, auth} ){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.username : publicKey ).toString("base64");

        const subscriptions = await this.loadAll(undefined, subscriber );

        if (typeof payload === "string") payload = JSON.stringify(payload );

        const promises = subscriptions.map( subscription => webPush.sendNotification( subscription.subscription, payload) );

        const results = await Promise.all(promises.map(p => p.catch(e => e)) );

        const updates = await Promise.all( results.map ( (it, index) => {

            if (it instanceof Error ){
                console.error("Error pushing notification", it);
                subscriptions[index].errors += 1;
                return subscriptions[index].save();
            } else
                return undefined;


        }));

        return updates;

    }

}

export default new NotificationSubscriptionsController();