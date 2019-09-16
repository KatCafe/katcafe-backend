import Controller from "../../controller";
import Topic from "./topic";
import CaptchaController from "../captcha/captcha-controller";
import Channel from "../channels/channel";
import StringHelper from "../../../helpers/string-helper";
import ScraperHelper from "../scraper/scraper-controller";
import FileController from "../files/file-controller";
import client from "../../redis";

class TopicsController extends Controller{

    constructor(){
        super('topics');
    }

    async createModel(channel, title='', link='', body='', author='', file, captcha) {

        title = StringHelper.removeWhiteSpace(title);
        link = StringHelper.removeWhiteSpace(link);
        body = StringHelper.removeWhiteSpace(body);
        author = StringHelper.removeWhiteSpace(author);

        if (!channel || channel.length < 1) throw "Channel was not selected";
        if (!title || title.length < 5) throw "Title is too small. Required at least 5 char";

        await CaptchaController.captchaSolution( captcha.solution, captcha.encryption ) ;

        if (channel[0] === '/') channel = channel.substr(1);
        if (channel.indexOf('us') === 0) channel = channel.substr(3);

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

        return topic;
    }

    async getByRank(revert , searchAlgorithm , searchQuery, search, index, count, load, req){

        return Controller.prototype.getByRank.call(this, Topic, revert, searchAlgorithm, searchQuery, search, index, count, load, req );

    }

}

export default new TopicsController();