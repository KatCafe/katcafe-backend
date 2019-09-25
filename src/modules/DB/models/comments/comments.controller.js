import Channel from "../channels/channel";

import StringHelper from "modules/helpers/string-helper";

import Comment from "./comment";
import Topic from "./../topics/topic"

import client from "modules/DB/redis"

import ScraperHelper from "modules/DB/models/scraper/scraper-controller"

import FileController from "modules/DB/models/files/file-controller"
import CaptchaController from "modules/DB/models/captcha/captcha-controller"
import VotesController from "./../votes/votes.controller"
import Controller from "../../controller";
import SessionController from "../auth/sessions/session-controller";

class CommentsController extends Controller{

    constructor(){
        super('comments', Comment);
    }

    async createModel({ topic, body='', link='', author='', file, captcha }, sessionKey) {

        let owner;
        try{
            const out = await SessionController.loginModelSession(sessionKey);
            owner = out.user;
        }catch(err){

        }

        topic = StringHelper.sanitizeText(topic);
        body = StringHelper.sanitizeText(body,false);
        link = StringHelper.sanitizeText(link);
        author = StringHelper.sanitizeText(author);

        if (!topic || topic.length < 1) throw "Topic was not selected";

        if (!file && !link && body.length < 5) throw "You need to provide either a link/file or write 5 characters";

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
                preview.sha256 = fileModel.sha256;

            } else throw "file not supported";

        }

        const uuid = await client.hincrbyAsync('comments:uuid', topicModel.slug.toLowerCase(), 1);

        const comment = new Comment( existsComment.slug, topicModel.slug, channelModel.slug, uuid, body, link, preview, author, owner ? owner.username : undefined, channelModel.country, new Date().getTime() );

        await comment.save();

        topicModel.comments++;
        await topicModel.saveScore();

        return comment;
    }

    async deleteModel(params){

        let topic, channel;

        const comment = await super.deleteModel(params, async comment => {

            topic = new Topic(comment.topic);
            await topic.load();

            channel = new Channel(comment.channel);
            await channel.load();

            return [topic, channel];
        });

        //refresh score of parent
        await topic.saveScore();

        return comment;
    }

    async getByRank(revert , searchAlgorithm , searchQuery, search, index, count, load, req){

        return super.getByRank.call(this, Comment, revert, searchAlgorithm, searchQuery, search, index, count, load, req );

    }

}

export default new CommentsController();