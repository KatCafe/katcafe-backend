import Controller from "../../controller";
import Topic from "./topic";
import Channel from "./../channels/channel";
import CaptchaController from "../captcha/captcha-controller";
import StringHelper from "../../../helpers/string-helper";
import ScraperHelper from "../scraper/scraper-controller";
import FileController from "../files/file-controller";
import client from "modules/DB/redis"
import SessionController from "../auth/sessions/session-controller";

class TopicsController extends Controller{

    constructor(){
        super('topics', Topic);
    }

    async createModel( {channel, title='', link='', body='', author='', file, captcha}, sessionKey ) {

        let owner;
        try{
            const out = await SessionController.loginModelSession(sessionKey);
            owner = out.user;
        }catch(err){

        }


        title = StringHelper.sanitizeText(title);
        link = StringHelper.sanitizeText(link);
        body = StringHelper.sanitizeText(body, false);
        author = StringHelper.sanitizeText(author);

        if (title.length + body.length < 3) throw "";

        if (!channel || channel.length < 1) throw "Channel was not selected";

        await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        if (channel[0] === '/') channel = channel.substr(1);
        if (channel.indexOf('us') === 0) channel = channel.substr(3);

        const channelModel = new Channel(channel);

        if (await channelModel.load() === false) throw "channel was not found";

        const slug = channelModel.slug + '/' + StringHelper.url_slug(  title + StringHelper.makeId( Math.max( 0, 8 - title.length)  )  ) ;
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
                preview.sha256 = fileModel.sha256;

            } else throw "file not supported";

        }

        const uuid = await client.hincrbyAsync('topics:uuid', 'total', 1);

        const topic = new Topic(existsTopic.slug, channelModel.slug, uuid, title, link, preview, body, author, owner ? owner.username : undefined, channelModel.country.toLowerCase(), new Date().getTime() );

        await topic.save();

        channelModel.topics++;
        await channelModel.saveScore();

        return topic;
    }

    async deleteModel(params){

        let channel;

        const topic = await super.deleteModel(params, async topic => {
            channel = new Channel(topic.channel);
            await channel.load();
            return [channel];
        });

        //refresh score of parent
        await channel.saveScore();

        return topic;
    }

    async getByRank(revert , searchAlgorithm , searchQuery, search, index, count, load, req){

        return super.getByRank.call(this, Topic, revert, searchAlgorithm, searchQuery, search, index, count, load, req );

    }

}

export default new TopicsController();