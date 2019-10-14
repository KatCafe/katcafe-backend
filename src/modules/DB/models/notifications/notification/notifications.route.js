import NotificationsController from "./notifications.controller"

export default function (express){

    express.post( '/notifications/clear-unread-notifications', async function(req, res ) {

        try{

            await NotificationsController.clearUnreadCount( {}, req);

            res.json({
                unreadCount: 0,
            })

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/notifications/get-unread-count-notifications', async function(req, res ) {

        try{

            let unread = await NotificationsController.getUnreadCount({}, req);

            if (!unread) unread = 0;
            if (unread) Number.parseInt(unread);

            res.json({
                unreadCount: unread,
            })

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}