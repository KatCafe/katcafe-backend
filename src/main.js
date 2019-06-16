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

global.appRoot = path.resolve(__dirname+'/../');

class APIServer {

    constructor(){

        this._initialized = false;
        this.createAPIServer();
    }

    createAPIServer(){

        let app = new express();
        app.use(cors());

        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        app.use(cookieParser());

        app.use(cors({ credentials: true }));
        app.use('/.well-known/acme-challenge', serve('./certificates/well-known/acme-challenge', true) );

        this.app = app;

        let options = {};
        let port = consts.PORT;

        try {

            options.key = fs.readFileSync('./certificates/private.key', 'utf8');
            options.cert = fs.readFileSync('./certificates/certificate.crt', 'utf8');
            options.ca = fs.readFileSync('./certificates/ca_bundle.crt', 'utf8');

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
            res.json ({ version: 1 } );
        });

        await client.conenctDB();

        Channels(this.app);
        Topics(this.app);
        Comments(this.app);
        Scraper(this.app);

    }


}



export default new APIServer();
