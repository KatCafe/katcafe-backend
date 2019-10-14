import Controller from "../../../controller";
import Notification from "./notification"
import CryptoHelper from "modules/helpers/crypto-helper"
import client from "modules/DB/redis"
import NotificationSubscribersController from "../notifications-subscribers/notification-subscribers.controller";
import Comment from "./../../comments/comment"
import Topic from "./../../topics/topic"
import Channel from "./../../channels/channel"

class NotificationsController extends  Controller{

    constructor(){
        super("notification", Notification);
    }

    async clearUnreadCount({subscriber, value = 1}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");
        return client.hdelAsync(this._table+'s:unread',subscriber);

    }

    async updateUnreadCount({subscriber, value = 1}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        return client.hincrbyAsync(this._table+'s:unread',subscriber, value);
    }

    async getUnreadCount({subscriber}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.user : publicKey ).toString("base64");

        return client.hgetAsync(this._table+'s:unread',subscriber);
    }

    async createNotification( {id, data, payload}, {publicKey, auth}){

        const subscribers = await NotificationSubscribersController.getSubscribers({id}, {publicKey, auth});

        const notifications = await Promise.all( subscribers.map( async subscriber => {

            let promise;

            const notification = new Notification( id, subscriber, data, 1, true );
            if (await notification.load() ) {
                notification.count += 1;
                notification.data.comments = Array.concat( notification.data.comments, data.comments ).splice(0, 3);
                notification.date = new Date().getTime();

                if (!notification.unread) {
                    notification.unread = true;
                    promise = this.updateUnreadCount({subscriber, value:1}, {publicKey, auth});
                }
            } else {
                promise = this.updateUnreadCount({subscriber, value: 1}, {publicKey, auth});
            }


            return Promise.all([
                notification.save(),
                promise,
            ]);

        }) );

        await NotificationSubscribersController.pushNotificationToSubscribers({id: id, subscribers, payload }, {auth, publicKey});


    }

    async createCommentNotification({id, comment, topic, channel}, {auth, publicKey} ){

        if (!comment){
            comment = new Comment(id);
            await comment.load();
        }

        return this.createNotification({
            id: comment.topic,
            data: {
                type: "comment",
                comments: [id],
            },
            payload: await this.getCommentNotificationPayload({id, comment, topic, channel})
        }, {auth, publicKey});


    }

    async getCommentNotificationPayload({id, comment, topic, channel}){

        if (!comment){
            comment = new Comment(id);
            await comment.load();
        }

        const commentJson = comment.toJSON(false,);

        if (!topic){
            topic = new Topic(comment.topic);
            await topic.load();
        }

        if (!channel){
            channel = new Channel(comment.channel);
            await channel.load();
        }

        return {
            title: `${commentJson.author || 'Anonymous'} replied to ${topic.title} in ${channel.name}`,
            body: `${commentJson.body.substr(0, 150)}`,
        }

    }

}

export default new NotificationsController();