import NotificationSubscribersController from "./notification-subscribers.controller"

export default function (express){

    express.post( '/notifications-subscribers/subscribe', async function(req, res ) {

        try{

            const {id, value} = req.body;

            if (value)
                await NotificationSubscribersController.addSubscriber( {id}, req);
            else
                await NotificationSubscribersController.removeSubscriber( {id}, req);

            res.json({ out: true });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}