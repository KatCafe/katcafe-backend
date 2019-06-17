import Channel from "../channels/channel";
import Topic from "../topics/topic";

import StringHelper from "modules/helpers/string-helper";
import Comment from "./comment";
import client from "../../redis";

import ScraperHelper from "modules/DB/models/scraper/scraper-controller"
import CryptoHelper from "modules/helpers/crypto-helper"

import FileController from "modules/DB/models/files/file-controller"
import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import CommentsController from "./comments.controller"



export default function (express){


    express.post( '/comments/create', async function(req, res ) {

        try{

            let { topic, body, link, author, file, captcha } = req.body;

            if (!topic || topic.length < 1) throw "Topic was not selected";
            if (!link) link = '';
            if (!body) body = '';
            if (!author ) author = '';

            if (!file && !link && body.length < 5) throw "You need to provide either a link/file or a text";

            const topicModel = new Topic(topic);
            if (await topicModel.load() === false ) throw "topic was not found";

            const channelModel = new Channel(topicModel.channel);

            if (await channelModel.load() === false) throw "channel was not found";

            const slug = topicModel.slug + '/';
            let existsComment = new Topic();
            let suffix = '';

            await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

            do{
                suffix = StringHelper.makeId(15);
                existsComment.slug = slug + suffix;
            } while (await existsComment.load() );

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

            const comment = new Comment( existsComment.slug.toLowerCase(), topicModel.slug.toLowerCase(), channelModel.slug.toLowerCase(), body, link, preview, author, channelModel.country, new Date().getTime() );

            await comment .save();
            res.json({result: true, comment : comment.toJSON() });


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

            const out = await CommentsController.getByRank( searchRevert, searchAlgorithm, searchQuery, search, index, count, true);
            res.json({result: true, comments: out });


        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

}