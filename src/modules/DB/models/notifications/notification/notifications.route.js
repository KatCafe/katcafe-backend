import NotificationsController from "./notifications.controller"
import CommentsController from "../../comments/comments.controller";

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

    express.post( '/notifications/top', async function(req, res ) {

        try{

            let { searchRevert, index, count} = req.body;

            const out = await CommentsController.getByRank( searchRevert, '', '', '', index, count, true, req);

            res.json({ comments: out.map( it=>it.toJSON(false, req.auth ) ) });


        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

}