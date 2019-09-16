import User from "./user"
import StringHelper from "modules/helpers/string-helper";

import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import AuthController from "./auth-controller"


export default function (express){

    express.post( '/auth/signup', async function(req, res ) {

        try{

            let { username, email, password, country, captcha } = req.body;

            if (!username || username.length < 1) throw "Name is to small. Required at least 1 char";
            if (StringHelper.url_slug( username ) !== username) throw "Username invalid";

            if (!email || email.length < 5) throw "Title is too small. Required at least 5 char";

            if (!password || password.length < 5) throw "Password too simple";

            if (!country || country.length === 0) throw "Country Code is required";

            country = country.toLowerCase();
            if (!country) country = 'us';

            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

            const slug = username;

            const channel = new Channel(slug, name, title, icon, cover, country, new Date().getTime() );

            if ( await channel.exists() )
                throw "Already exists";
            else{
                await channel.save();
                res.json({result: true, channel: channel.toJSON() });
            }


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/auth/signin/', async function(req, res ) {

        try{

            const { userEmail, password, captcha} = req.body;

            const channel = new User(userEmail);

            if ( await channel.load() === false)
                throw "Not found";

            res.json({result: true, channel: channel.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });


}