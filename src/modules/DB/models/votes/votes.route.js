import Vote from "./vote"
import client from "../../redis";

import CaptchaController from "modules/DB/models/captcha/captcha-controller"

export default function (express){

    express.post( '/vote/vote', async function(req, res ) {

        try{

            let { slug, value, parentType } = req.body;
            if (value !== -1 || value !== 0 || value !== 1) throw "value is invalid";
            if (parentType !== 'comment' || parentType !== 'topic') throw "parenType is invalid";

            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            if (!ip) throw "ip is invalid";

            let vote = new Vote( slug, ip, value, new Date().getTime() );

            if (await vote.load() ){

                if (vote.value === value )
                    return res.json({result: true, vote: vote.toJSON() });

                vote.date = new Date().getTime();
                vote.value = value;

            }

            await vote.save();

            return res.json({result: true, vote: vote.toJSON() });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/vote/get/*', async function(req, res ) {

        try{

            let slug = req.params[0];

            if (!slug || slug.length < 1) throw "slug is not right";
            if (slug[0] === '/') slug = slug.substr(1);

            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            let vote = new Vote(slug, ip, value, new Date().getTime() );

            if ( await vote.load() === false)
                throw "Not found";

            res.json({result: true, topic: vote.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });



}