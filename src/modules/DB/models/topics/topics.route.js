import Topic from "./topic"
import client from "../../redis";
import TopicsController from "./topics.controller"
import CommentsController from "./../comments/comments.controller"
import VotesController from "../votes/votes.controller";
import StringHelper from "modules/helpers/string-helper";

export default function (express){

    express.post( '/topics/create', async function(req, res ) {

        try{

            const topic = await TopicsController.createModel(req.body, req.auth);

            res.json({ topic: topic.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/topics/get/*', async function(req, res ) {

        try{


            let slug = req.params[0];

            if (!slug || slug.length < 1) throw "slug is not right";
            slug = StringHelper.trimSlashes(slug);

            const topic = new Topic(slug);

            if ( await topic.load() === false)
                throw "Not found";

            topic.myVote = await VotesController.getVote( topic.slug, req );

            res.json({ topic: topic.toJSON()});


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    const COMMENTS_RETURN = 3;

    express.post( '/topics/top', async function(req, res ) {

        try{

            let {searchRevert, searchAlgorithm, searchQuery, search, index, count} = req.body;

            if (!search) search = '';
            if (search[0] === '/') search = search.substr(1);

            if (searchQuery === 'country' && !search ) search = 'us';

            const out = await TopicsController.getByRank( searchRevert, searchAlgorithm, searchQuery, search, index, count, true, req);

            let outComments = [];
            for (const topic of out) {

                const comments = await CommentsController.getByRank( searchRevert, 'hot', 'topic', topic.slug, 1, COMMENTS_RETURN, true, req );
                outComments = outComments.concat(comments);

            }

            res.json({topics: out.map( it=>it.toJSON(false, req.auth) ), comments: outComments.map( it=>it.toJSON(false, req.auth) ) });


        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

    express.post( '/topics/delete', async function(req, res ) {

        try{

            await TopicsController.deleteModel({ auth: req.auth, slug: req.body.slug })

            res.json( {result: true} );


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });


}