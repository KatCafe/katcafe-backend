import Vote from "./vote"
import VotesController from "./votes.controller"
import StringHelper from "modules/helpers/string-helper";

import client from "../../redis";

export default function (express){

    express.post( '/votes/vote', async function(req, res ) {

        try{

            const {vote, prevVote} = await VotesController.createModel( req.body, req );

            return res.json({ vote: vote.toJSON(), prevVote });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/votes/get', async function(req, res ) {

        try{

            let {slug} = req.body;

            if (!slug || slug.length < 1) throw "slug is not right";
            slug = StringHelper.trimSlashes(slug);

            let vote = new Vote(slug, req.ipAddress, value, new Date().getTime() );

            if ( await vote.load() === false)
                throw "Not found";

            res.json({vote: vote.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}