import Controller from "../../../controller";
import CryptoHelper from "modules/helpers/crypto-helper"
import client from "modules/DB/redis"
import NotificationSubscriptionsController from "./../notifications-subscriptions/notification-subscriptions.controller"

class NotificationSubscribers extends  Controller{

    constructor(){
        super("subscriber", null);
    }

    async addSubscriber({id, subscriber}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        await client.saddAsync(this._table + "s:"+id+":list", subscriber);

    }

    async removeSubscriber({id, subscriber}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        await client.sremAsync(this._table + "s:"+id+":list", subscriber);
    }

    async getSubscribers({id}, {publicKey, auth}){

        let subscribers = await this.getAllIds(id);

        //filtering removing except me
        const except1 = auth ? CryptoHelper.md5(auth.user ).toString("base64") : undefined;
        const except2 = CryptoHelper.md5( publicKey).toString("base64");

        subscribers = subscribers.filter( it => it !== except1 && it !== except2 );

        return subscribers;

    }

    async pushNotificationToSubscribers( { id, payload, subscribers }, {publicKey, auth} ){

        if (!subscribers) subscribers = this.getSubscribers({id}, {publicKey, auth});

        const promises = subscribers.map( subscriber => NotificationSubscriptionsController.pushNotification( {subscriber, payload}, {publicKey, auth} ) );

        return Promise.all(promises);

    }

}

export default new NotificationSubscribers();