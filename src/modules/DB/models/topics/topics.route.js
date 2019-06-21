import Topic from "./topic"
import Channel from "../channels/channel";
import StringHelper from "modules/helpers/string-helper";
import client from "../../redis";
import ScraperHelper from "../scraper/scraper-controller";

import FileController from "../files/file-controller";
import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import TopicsController from "./topics.controller"
import CommentsController from "./../comments/comments.controller"

export default function (express){

    express.post( '/topics/create', async function(req, res ) {

        try{

            let { channel, title, link, body, author, file, captcha } = req.body;

            if (!channel || channel.length < 1) throw "Channel was not selected";
            if (!title || title.length < 5) throw "Title is too small. Required at least 5 char";
            if (!link) link = '';
            if (!body) body = '';
            if (!author ) author = '';

            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

            if (channel[0] === '/') channel = channel.substr(1);

            const channelModel = new Channel(channel);

            if (await channelModel.load() === false) throw "channel was not found";

            const slug = channelModel.slug + '/' + StringHelper.url_slug(  title ) ;
            let existsTopic = new Topic();
            let suffix = '';

            do{
                existsTopic.slug = slug + suffix;
                suffix = '-' + StringHelper.makeId(8);
            } while (await existsTopic.load() );

            let preview = '';
            if (link) {

                const previewData = await ScraperHelper.getPreview(link);

                if (previewData) {
                    preview = previewData.image;
                    if (!body) body = previewData.description || previewData.title || '';
                }

            }

            if (file){

                if (file.base64) {

                    file.title = body;
                    const fileModel = await FileController.processUploadedBase64File(file );

                    preview = fileModel.preview;
                    preview.full = fileModel.slug;

                } else throw "file not supported";

            }

            const uuid = await client.hincrbyAsync('topics:uuid', 'total', 1);

            const topic = new Topic(existsTopic.slug, channelModel.slug, uuid, title, link, preview, body, author, channelModel.country.toLowerCase(), new Date().getTime() );

            await topic.save();
            res.json({result: true, topic: topic.toJSON() });


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

            res.json({result: true, topic: topic.toJSON()});


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

            const out = await TopicsController.getByRank( searchRevert, searchAlgorithm, searchQuery, search, index, count, true);

            let outComments = [];
            for (const topic of out){

                const comments = await CommentsController.getByRank( false, 'date', 'topic', topic.slug, 1, 2, true );
                outComments = outComments.concat(comments);

                topic.commentsPage = {
                    pageIndex: 1,
                    count: 2,
                };

            }

            res.json({result: true, topics: out.map( it=>it.toJSON() ), comments: outComments.map( it=>it.toJSON() ) });


        }catch(err){
            res.status(500).json( err.toString() );
        }


    });


}