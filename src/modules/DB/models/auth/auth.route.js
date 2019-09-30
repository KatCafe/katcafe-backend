import AuthController from "./auth-controller"
import SessionController from "./sessions/session-controller"

export default function (express){

    express.post( '/auth/signup', async function(req, res ) {

        try{

            const user = await AuthController.createUserModel(req.body);

            const out = await AuthController.loginModel({userEmail: req.body.username, password: req.body.password, captcha: undefined}, false);

            res.json( { user: user.toJSON(), session: out.session.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/auth/signin/', async function(req, res ) {

        try{

            const out = await AuthController.loginModel(req.body, true);

            res.json({ user: out.user.toJSON(), session: out.session.toJSON() });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/auth/signin-session', async function(req, res ) {

        try{

            const out = await SessionController.loginModelSession(req.body.key, true);

            res.json({ user: out.user.toJSON(), session: out.session.toJSON() });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/auth/logout/', async function(req, res ) {

        try{

            const out = await SessionController.logoutSession( req.headers.session, true);

            res.json( {result: true } );

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}