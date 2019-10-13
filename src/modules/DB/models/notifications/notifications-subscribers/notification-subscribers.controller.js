import Controller from "../../../controller";
import CryptoHelper from "modules/helpers/crypto-helper"
import client from "modules/DB/redis"
import NotificationSubscriptionsController from "./../notifications-subscriptions/notification-subscriptions.controller"

class NotificationSubscribers extends  Controller{

    constructor(){
        super("subscriber", null);
    }

    async addSubscriber({id, who}, {publicKey, auth}){

        if (!who) who = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        await client.saddAsync(this._table + "s:"+id+":list", who);

    }

    async removeSubscriber({id, who}, {publicKey, auth}){

        if (!who) who = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        await client.sremAsync(this._table + "s:"+id+":list", who);
    }

    async pushNotificationToSubscribers( { id, payload }, {publicKey, auth} ){

        let whoIds = await this.getAllIds(id);

        //filtering removing exceptWho
        const whoExcept1 = auth ? CryptoHelper.md5(auth.user ).toString("base64") : undefined;
        const whoExcept2 = CryptoHelper.md5( publicKey).toString("base64");

        whoIds = whoIds.filter( it => it !== whoExcept1 && it !== whoExcept2 );

        const promises = whoIds.map( who => NotificationSubscriptionsController.pushNotification( {who, payload}, {publicKey, auth} ) );

        return Promise.all(promises);

    }

}

export default new NotificationSubscribers();