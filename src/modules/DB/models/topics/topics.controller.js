import Controller from "../../controller";
import Topic from "./topic";
import Channel from "./../channels/channel";
import StringHelper from "modules/helpers/string-helper";
import ScraperHelper from "../scraper/scraper-controller";
import FileController from "../files/file-controller";
import client from "modules/DB/redis"
import TrialsController from "../trials/trials.controller";
import NotificationSubscribersController from "./../notifications/notifications-subscribers/notification-subscribers.controller";

class TopicsController extends Controller{

    constructor(){
        super('topic', Topic, true);
    }

    async createModel( {channel, title='', link='', body='', isAnonymous=false, file, captcha}, {auth, publicKey, ipAddress} ) {

        title = StringHelper.sanitizeText(title);
        link = StringHelper.sanitizeText(link);
        body = StringHelper.sanitizeText(body, false);

        if ( title.length + body.length <= 3) throw "Too few letters. Minimum 4 letters";

        if (!channel || channel.length < 1) throw "Channel was not selected";

        if (typeof isAnonymous !== "boolean") throw "isAnonymous is not boolean";

        await TrialsController.process({category: 'spam:tpc', captcha}, {auth, ipAddress});

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

        const uuid = await client.hincrbyAsync(this._table+'s:uuid', 'total', 1);

        const topic = new Topic(existsTopic.slug, channelModel.slug, uuid, title, link, preview, body, isAnonymous, auth ? auth.username : undefined, channelModel.country.toLowerCase(), ipAddress, new Date().getTime() );

        await topic.save();

        channelModel.topics++;
        await channelModel.saveScore();

        await NotificationSubscribersController.addSubscriber({id: topic.slug }, {auth, publicKey });

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


}

export default new TopicsController();