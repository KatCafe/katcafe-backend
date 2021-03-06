import Channel from "./channel"

import ChannelsController from "./channels.controller"
import StringHelper from "../../../helpers/string-helper";

export default function (express){

    express.post( '/channels/create', async function(req, res ) {

        try{

            const channel = await ChannelsController.createModel(req.body, req);

            res.json({ channel: channel.toJSON() });

        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/channels/get', async function(req, res ) {

        try{

            let slug = decodeURI(req.body.slug);

            if (!slug || slug.length < 1) throw "slug is not right";
            slug = StringHelper.trimSlashes(slug);

            const channel = new Channel(slug);

            if ( await channel.load() === false)
                throw "Not found";

            res.json({ channel: channel.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.post( '/channels/top', async function(req, res ) {

        try{

            let {searchRevert, algorithm, country, index, count} = req.body;

            if (!country ) country = 'us';
            if (!index) index = 1;
            if ( !count ) count = 10;
            if (!algorithm ) algorithm = 'hot';

            index = Number.parseInt(index);
            count = Number.parseInt(count);

            country = country.toLowerCase();
            count = Math.min( count, 40);

            const out = await ChannelsController.getByRank( searchRevert, algorithm, 'country', country, (index-1)*count, index*count-1 );

            if (index === 1){
                const item = country;
                out.splice(0, 0, item );
            }

            res.json({ channels: out });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}