import User from "./user"
import StringHelper from "modules/helpers/string-helper";

import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import AuthController from "./auth-controller"


export default function (express){

    express.post( '/auth/signup', async function(req, res ) {

        try{

            const user = await AuthController.createModel(req.body);

            res.json({result: true, user: user.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/auth/signin/', async function(req, res ) {

        try{

            const { userEmail, password, captcha} = req.body;

            const user = new User(userEmail);

            if ( await user.load() === false)
                throw "Not found";

            res.json({result: true, user: user.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });


}