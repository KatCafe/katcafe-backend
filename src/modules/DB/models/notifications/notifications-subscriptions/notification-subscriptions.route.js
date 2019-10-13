import NotificationSubscriptionsController from "./notification-subscriptions.controller"
import constsSecret from "consts/consts-secret"
import secp256k1 from "modules/helpers/secp256k1"

export default function (express){

    express.post( '/notifications-subscriptions/get-vapid-key', async function(req, res ) {

        res.json({ vapidPublicKey: constsSecret.vapid.publicKey });

    });

    express.post( '/notifications-subscriptions/register-subscription', async function(req, res ) {

        try{
            const {subscription, signature} = req.body;
            const {publicKey} = req;

            if (req.auth)
                subscription.user = req.auth.username;
            else {
                delete subscription.user;
                if (publicKey.length < 62) throw "publicKey is invalid";
            }

            const out = secp256k1.verify( JSON.stringify(subscription), signature, publicKey );
            if (!out) throw "invalid signature";

            delete subscription.user;

            const notificationSubscription = await NotificationSubscriptionsController.createNotificationSubscription( {subscription}, req );

            await NotificationSubscriptionsController.pushNotification( {}, req);

            res.json({ out: true });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}