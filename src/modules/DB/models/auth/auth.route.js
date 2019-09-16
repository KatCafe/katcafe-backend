import User from "./users/user"
import StringHelper from "modules/helpers/string-helper";

import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import AuthController from "./auth-controller"
import SessionController from "./sessions/session-controller"

export default function (express){

    express.post( '/auth/signup', async function(req, res ) {

        try{

            const user = await AuthController.createUserModel(req.body);

            res.json({result: true, user: user.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/auth/signin/', async function(req, res ) {

        try{

            const out = await AuthController.loginModel(req.body);

            res.json({result: true, user: out.user.toJSON(), session: out.session.toJSON() });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/auth/signin-session/:key', async function(req, res ) {

        try{

            const out = await SessionController.loginModelSession(req.params.key, true);

            res.json({result: true, user: out.user.toJSON(), session: out.session.toJSON() });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}