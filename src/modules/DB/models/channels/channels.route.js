import Channel from "./channel"
import StringHelper from "modules/helpers/string-helper";
import client from "modules/DB/redis";

import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import ChannelsController from "./channels.controller"

export default function (express){

    express.post( '/channels/create', async function(req, res ) {

        try{

            let { name, title, icon, cover, country, captcha } = req.body;

            if (!name || name.length < 1) throw "Name is to small. Required at least 1 char";
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

    express.get( '/channels/get/*', async function(req, res ) {

        try{

            let slug = req.params[0];

            if (!slug || slug.length < 1) throw "slug is not right";

            if (slug[0]==='/') slug = slug.substr(1 );

            const channel = new Channel(slug);

            if ( await channel.load() === false)
                throw "Not found";

            res.json({result: true, channel: channel.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/channels/:algorithm/:country?/:index?/:count?', async function(req, res ) {

        try{

            let {searchRevert, algorithm, country, index, count} = req.params;

            if (!country ) country = 'us';
            if (!index) index = 1;
            if ( !count ) count = 10;
            if (!algorithm ) algorithm = 'hot';

            country = country.toLowerCase();
            count = Math.min( count, 40);

            const out = await ChannelsController.getByRank( searchRevert, algorithm, country, '',(index-1)*count, index*count-1 );

            res.json({result: true, channels: out });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}