import Topic from "./topic"
import client from "../../redis";
import TopicsController from "./topics.controller"
import CommentsController from "./../comments/comments.controller"
import VotesController from "../votes/votes.controller";
import SessionController from "../auth/sessions/session-controller";

export default function (express){

    express.post( '/topics/create', async function(req, res ) {

        try{

            const topic = await TopicsController.createModel(req.body, req.headers.session);

            res.json({ topic: topic.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/topics/get/*', async function(req, res ) {

        try{

            let slug = req.params[0];

            if (!slug || slug.length < 1) throw "slug is not right";
            if (slug[0] === '/') slug = slug.substr(1);

            const topic = new Topic(slug);

            if ( await topic.load() === false)
                throw "Not found";

            topic.myVote = await VotesController.getVote( topic.slug, req );

            res.json({ topic: topic.toJSON()});


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/topics/top', async function(req, res ) {

        try{

            let {searchRevert, searchAlgorithm, searchQuery, search, index, count} = req.body;

            if (!search) search = '';
            if (search[0] === '/') search = search.substr(1);

            if (searchQuery === 'country' && !search ) search = 'us';

            const out = await TopicsController.getByRank( searchRevert, searchAlgorithm, searchQuery, search, index, count, true, req);

            let outComments = [];
            for (const topic of out){

                const comments = await CommentsController.getByRank( false, 'date', 'topic', topic.slug, 1, 2, true, req );
                outComments = outComments.concat(comments);

                topic.commentsPage = {
                    pageIndex: 1,
                    count: 2,
                };

            }

            res.json({topics: out.map( it=>it.toJSON() ), comments: outComments.map( it=>it.toJSON() ) });


        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

    express.post( '/topics/delete', async function(req, res ) {

        try{

            await TopicsController.deleteModel({session: req.headers.session, slug: req.body.slug })

            res.json( {result: true} );


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });


}