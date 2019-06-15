import Topic from "./topic"
import Channel from "../channels/channel";
import StringHelper from "modules/helpers/string-helper";

export default function (express){

    express.post( '/topics/create', async function(req, res ) {

        try{

            let { channel, title, link, body, author } = req.body;

            if (!channel || channel.length < 1) throw "Name is to small. Required at least 1 char";
            if (!title || title.length < 5) throw "Title is too small. Required at least 5 char";
            if (!link) link = '';
            if (!body) body = '';
            if (!author ) author = '';


            const channelModel = new Channel(channel);

            if (await channelModel.load() === false) throw "channel was not found";

            const slug = channelModel.slug + '/' + StringHelper.url_slug(  title );
            let existsTopic = new Topic();
            let suffix = '';

            do{
                existsTopic.slug = slug + suffix;
                suffix = '-' + StringHelper.makeId(8);
            } while (await existsTopic.load() );

            let image = '';

            const topic = new Topic(existsTopic.slug, channelModel.slug, title, link, image, body, author, channelModel.country, new Date().getTime() );

            await topic.save();
            res.json({result: true, topic: topic.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

    express.get( '/topics/get/:slugChannel/:slugTopic', async function(req, res ) {

        try{

            let { slugChannel, slugTopic } = req.params;

            if (!slug || slug.length < 1) throw "slug is not right";

            const channel = new Channel(slug);

            if ( await channel.load() === false)
                throw "Not found";

            res.json({result: true, channel: channel.toJSON() });


        }catch(err){
            res.status(500).json( err.toString() );
        }

    });

}