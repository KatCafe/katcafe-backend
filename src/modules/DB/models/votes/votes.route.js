import Vote from "./vote"
import VotesController from "./votes.controller"

import client from "../../redis";

export default function (express){

    express.post( '/votes/vote', async function(req, res ) {

        try{

            const vote = VotesController.createModel( req.body, req.headers['x-forwarded-for'] || req.connection.remoteAddress );

            return res.json({result: true, vote: vote.toJSON() });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/votes/get/*', async function(req, res ) {

        try{

            let slug = req.params[0];

            if (!slug || slug.length < 1) throw "slug is not right";
            if (slug[0] === '/') slug = slug.substr(1);

            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            let vote = new Vote(slug, ip, value, new Date().getTime() );

            if ( await vote.load() === false)
                throw "Not found";

            res.json({result: true, vote: vote.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}