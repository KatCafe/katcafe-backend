import Channels from "modules/DB/models/channels/channels.route"
import Topics from "modules/DB/models/topics/topics.route"
import Comments from "modules/DB/models/comments/comments.route"
import Scraper from "modules/DB/models/scraper/scraper.route"
import Captcha from "modules/DB/models/captcha/captcha.route"
import Votes from "modules/DB/models/votes/votes.route"
import Auth from "modules/DB/models/auth/auth.route"
import Admin from "modules/DB/models/admin/admin.route"
import Trials from "modules/DB/models/restrictions/trials/trials.route"
import NotificationSubscriptions from "modules/DB/models/notifications/notifications-subscriptions/notification-subscriptions.route"
import NotificationSubscribers from "modules/DB/models/notifications/notifications-subscribers/notification-subscribers.route"
import Notifications from "modules/DB/models/notifications/notification/notifications.route"

export default function (app){

    app.get('/version', (req, res)=>{
        res.json ({ version: 1 } );
    });

    app.get('/hello', (req, res)=>{
        res.json ({ hello: 'world' } );
    });

    app.get('/', (req, res)=>{
        res.json ({ ping: 'pong' } );
    });

    Channels(app);
    Topics(app);
    Comments(app);
    Scraper(app);
    Captcha(app);
    Votes(app);
    Auth(app);
    Admin(app);
    Trials(app);
    NotificationSubscriptions(app);
    NotificationSubscribers(app);
    Notifications(app);

}