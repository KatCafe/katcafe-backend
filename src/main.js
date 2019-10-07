import SessionController from "./modules/DB/models/auth/sessions/session-controller";

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

import SocketServer from "modules/socket-server/socket-server"

import Sitemap from "modules/sitemap/sitemap"


global.appRoot = path.resolve(__dirname+'/../');

class APIServer {

    constructor(){

        this._initialized = false;
        this.createAPIServer();
    }

    createAPIServer(){

        const app = new express();

        // var corsOptions = {
        //     origin: 'https://katcafe.org',
        //     allowedHeaders: ['session','user-agent'],
        //     optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        // };
        //
        // app.use(cors(corsOptions));

        app.use(function (req, res, next) {

            // Website you wish to allow to connect
            res.setHeader('Access-Control-Allow-Origin', consts.DOMAIN);

            // Request methods you wish to allow
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

            // Request headers you wish to allow
            res.setHeader('Access-Control-Allow-Headers', 'session, user-agent, X-Requested-With, content-type');

            // Pass to next layer of middleware
            // intercept OPTIONS method
            if (req.method === 'OPTIONS')
                res.sendStatus(200);

            else
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

        this.app.use( async (req, res, next)=>{

            req.ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            req.auth = null;
            try{
                const out = await SessionController.loginModelSession(req.headers.session);
                req.auth = out.user;
            }catch(err){
                req.authError = err;
            }

            next();
        });



        await client.conenctDB();

        SocketServer(this.app, this.server);


        Sitemap.initExpress(this.app);

    }


}



export default new APIServer();
