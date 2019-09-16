import Channel from "./channel"

import ChannelsController from "./channels.controller"

export default function (express){

    express.post( '/channels/create', async function(req, res ) {

        try{

            const channel = await ChannelsController.createModel(req.body);

            res.json({result: true, channel: channel.toJSON() });

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

            const out = await ChannelsController.getByRank( searchRevert, algorithm, 'country', country, (index-1)*count, index*count-1 );

            res.json({result: true, channels: out });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}