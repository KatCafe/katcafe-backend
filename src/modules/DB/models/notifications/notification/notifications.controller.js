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

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.username : publicKey ).toString("base64");
        return client.delAsync(this._table+'s:unread:'+subscriber, );

    }

    async updateUnreadCount({subscriber, value = 1}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.username : publicKey ).toString("base64");

        return client.saddAsync(this._table+'s:unread:'+subscriber, value);
    }

    async getUnreadCount({subscriber}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.username : publicKey ).toString("base64");

        return client.scardAsync(this._table+'s:unread:'+subscriber );
    }

    async markNotificationRead({id, subscriber, value = false}, {publicKey, auth}){

        if (!subscriber) subscriber = CryptoHelper.md5(auth ? auth.username : publicKey ).toString("base64");

        const notification = new Notification(id, subscriber);
        await notification.load();

        notification.unread = !value;

        return notification.save();

    }

    async createNotification( {id, data, payload}, {publicKey, auth}){

        const subscribers = await NotificationSubscribersController.getSubscribers({id}, {publicKey, auth});

        //add notifications
        const notifications = await Promise.all( subscribers.map( async subscriber => {

            let promise;

            const notification = new Notification( id, subscriber, data, 1, true );
            if (await notification.load() ) {
                notification.count += 1;
                notification.data.comments = Array.concat( notification.data.comments, data.comments ).splice(0, 3);
                notification.date = new Date().getTime();

                if (!notification.unread)
                    notification.unread = true;

            }

            promise = this.updateUnreadCount({subscriber, value: id}, {publicKey, auth});

            return Promise.all([
                notification.save(),
                promise,
            ]);

        }) );

        const pushNotifications = NotificationSubscribersController.pushNotificationToSubscribers({id: id, subscribers, payload }, {auth, publicKey});


        return Promise.all( notifications.concat(pushNotifications) );

    }

    async getPayload({notification}, req){

        if (notification.data.type === 'comment') return this.getCommentNotificationPayload({id: notification.data.comments[0], useTags: true}, req);

        throw "payload was not identified";
    }

    async createCommentNotification({id, comment, topic, channel}, req ){

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
            payload: await this.getCommentNotificationPayload({id, comment, topic, channel }, req)
        }, req);


    }

    async getCommentNotificationPayload({id, comment, topic, channel, useTags = false}, {auth}){

        if (!comment){
            comment = new Comment(id);
            await comment.load();
        }

        const commentJson = comment.toJSON(false, auth );

        if (!topic){
            topic = new Topic(comment.topic);
            await topic.load();
        }

        if (!channel){
            channel = new Channel(comment.channel);
            await channel.load();
        }

        let title = `${ commentJson.author ? '<b>'+commentJson.author+'</b>' : 'Anonymous'} replied to <b>${topic.title}</b> in <b>${channel.name}</b>:`;

        if (!useTags) {
            title = title.replace(/<b>/g,'');
            title = title.replace(/<\/b>/g,'');
        }

        return {
            title: title,
            body: `${commentJson.body.substr(0, 100)}`,
            icon: channel.icon,
            url: comment.url(),
        }

    }

    async getByRank( revert = false, searchAlgorithm = '', searchQuery, search, index, count, load, req){

        if (!searchQuery) searchQuery = CryptoHelper.md5(req.auth ? req.auth.username : req.publicKey ).toString("base64");

        return super.getByRank(revert, searchAlgorithm, searchQuery, search, index, count, load, req);
    }

}

export default new NotificationsController();