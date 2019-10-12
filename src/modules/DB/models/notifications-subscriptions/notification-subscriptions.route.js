import NotificationSubscriptionsController from "./notification-subscriptions.controller"
import StringHelper from "../../../helpers/string-helper";
const webPush = require('web-push');
import constsSecret from "consts/consts-secret"
import secp256k1 from "modules/helpers/secp256k1"

export default function (express){

    express.post( '/notifications-subscriptions/get-vapid-key', async function(req, res ) {

        res.json({ vapidPublicKey: constsSecret.vapid.publicKey });

    });

    express.post( '/notifications-subscriptions/subscribe', async function(req, res ) {

        try{
            const {subscription, publicKey, signature} = req.body;

            if (req.auth)
                subscription.user = req.auth.username;
            else
                delete subscription.user;

            const out = secp256k1.verify( JSON.stringify(subscription), signature, publicKey );
            if (!out) throw "invalid signature";

            console.log("subscription", subscription);

            const notificationSubscription = await NotificationSubscriptionsController.createNotificationSubscription(subscription.user ? subscription.user : publicKey,subscription );

            const payload = JSON.stringify({
                title: 'Title',
                body: "Body",
            });

            webPush.sendNotification(subscription, payload).catch(error => console.error(error));

            res.json({ out: true });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}