if(( typeof window !== 'undefined' && !window._babelPolyfill) ||
    ( typeof global !== 'undefined' && !global._babelPolyfill)) {
    require('babel-polyfill')
}

const express = require('express');
const https = require('https');
const http = require('http');
const path = require('path')
const cors = require('cors');
const fs = require('fs')

const resolve = file => path.resolve(__dirname, file)

const serve = (path, cache) => express.static(resolve(path), {
    maxAge: cache ? 1000 * 60 * 60 * 24 * 30 : 0
});

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

import client from "modules/DB/redis"

import consts from 'consts/consts';

import Channels from "modules/DB/models/channels/channels.route"
import Topics from "modules/DB/models/topics/topics.route"
import Comments from "modules/DB/models/comments/comments.route"
import Scraper from "modules/DB/models/scraper/scraper.route"
import Captcha from "modules/DB/models/captcha/captcha.route"
import Votes from "modules/DB/models/votes/votes.route"
import Auth from "modules/DB/models/auth/auth.route"
import Admin from "modules/DB/models/admin/admin.route"

global.appRoot = path.resolve(__dirname+'/../');

class APIServer {

    constructor(){

        this._initialized = false;
        this.createAPIServer();
    }

    createAPIServer(){

        const app = new express();

        app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin",consts.domain); // update to match the domain you will make the request from
            res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
            res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, X-Requested-With");
            next();
        });

        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        app.set('query parser', "extended");
        app.use(cookieParser());

        app.use('/.well-known/acme-challenge', serve('./certificates/well-known/acme-challenge', true) );

        if (!fs.existsSync('./public')) fs.mkdirSync('./public');
        if (!fs.existsSync('./public/images')) fs.mkdirSync('./public/images');

        app.use('/public', express.static('./public'));

        this.app = app;

        let options = {};
        let port = consts.PORT;

        try {

            if (fs.existsSync('./certificates/ca_bundle.crt')) {
                options.key = fs.readFileSync('./certificates/private.key', 'utf8');
                options.cert = fs.readFileSync('./certificates/certificate.crt', 'utf8');
                options.ca = fs.readFileSync('./certificates/ca_bundle.crt', 'utf8');
            } else {
                options.key = fs.readFileSync('./certificates/private.pem', 'utf8');
                options.cert = fs.readFileSync('./certificates/certificate.pem', 'utf8');
            }

            this.server = https.createServer( options, app).listen(port, ()=>{

                this._initializeExpress();

                console.log("HTTPS Express was opened on port "+port);

            });

        } catch (exception){

            //cloudflare generates its own SSL certificate
            this.server = http.createServer(app).listen(port, ()=>{

                this._initializeExpress();

                console.log(`http express started at localhost:${port}`)

            });


        }
    }

    async _initializeExpress(){

        if (this._initialized)
            return false;

        this._initialized = true;

        this.app.get('/version', (req, res)=>{
            res.json ({ version: 1 } );
        });

        this.app.get('/hello', (req, res)=>{
            res.json ({ hello: world } );
        });

        this.app.get('/', (req, res)=>{
            res.json ({ ping: 'pong' } );
        });

        await client.conenctDB();

        Channels(this.app);
        Topics(this.app);
        Comments(this.app);
        Scraper(this.app);
        Captcha(this.app);
        Votes(this.app);
        Auth(this.app);
        Admin(this.app);

    }


}



export default new APIServer();
