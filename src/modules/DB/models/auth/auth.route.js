import Channel from "./channel"
import StringHelper from "modules/helpers/string-helper";

import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import AuthController from "./auth-controller"


export default function (express){

    express.post( '/channels/create', async function(req, res ) {

        try{

            let { name, title, icon, cover, country, captcha } = req.body;

            if (!name || name.length < 1) throw "Name is to small. Required at least 1 char";
            if (name.length === 2) throw "2 letters are reserved for countries";

            if (!title || title.length < 5) throw "Title is too small. Required at least 5 char";
            if (!country || country.length === 0) throw "Country Code is required";

            country = country.toLowerCase();
            if (!country) country = 'us';

            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

            const slug = (country !== 'us' ? country +'/' : '') + StringHelper.url_slug( name );

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

    express.post( '/signin/', async function(req, res ) {

        try{

            const { userEmail, password} = req.body;

            const channel = new User(slug);

            if ( await channel.load() === false)
                throw "Not found";

            res.json({result: true, channel: channel.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });


}