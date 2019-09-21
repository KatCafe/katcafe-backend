import AuthController from "./../auth/auth-controller"
import AdminController from "./admin-controller"

export default function (express){

    express.post( '/admin/remove-wrong-data', async function(req, res ) {

        try{

            await AdminController.removeWrongData( req.body, req.headers.session);

            res.json( { result: true });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/admin/update-scores', async function(req, res ) {

        try{

            await AdminController.updatesScores( req.body, req.headers.session);

            res.json( { result: true });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}