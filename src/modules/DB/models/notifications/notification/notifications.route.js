import NotificationsController from "./notifications.controller"

export default function (express){

    express.post( '/notifications/get-unread-notifications', async function(req, res ) {

        try{

            const unread = await NotificationsController.getUnreadCount();

            res.json({
                unread,
            })

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}