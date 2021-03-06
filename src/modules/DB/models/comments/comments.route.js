import CryptoHelper from "modules/helpers/crypto-helper"

import CommentsController from "./comments.controller"
import Comment from "./comment"

export default function (express){


    express.post( '/comments/create', async function(req, res ) {

        try{

            const comment = await CommentsController.createModel(req.body, req);

            res.json({ comment : comment.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/comments/top', async function(req, res ) {

        try{

            let { searchRevert, searchAlgorithm, searchQuery, search, index, count} = req.body;

            if (!search) search = '';
            if (search[0] === '/') search = search.substr(1);

            if (searchQuery === 'country' && !search ) search = 'us';

            const out = await CommentsController.getByRank( searchRevert, searchAlgorithm, searchQuery, search, index, count, true, req);

            res.json({ comments: out.map( it=>it.toJSON(false, req.auth ) ) });


        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

    express.post( '/comments/delete', async function(req, res ) {

        try{

            await CommentsController.deleteModel({auth: req.auth, slug: req.body.slug } );

            res.json( {result: true} );


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}