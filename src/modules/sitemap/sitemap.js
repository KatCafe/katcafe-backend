import consts from 'consts/consts';

import SitemapGenerator from 'sitemap-generator';
import NetworkHelper from "modules/helpers/network-helper"

const start = consts.SITEMAP;

class Sitemap{

    constructor(){

        this._lastTime = 0;
        this._finished = true;

        // start the crawler
        if (start)
            setInterval( ()=>{

                try{

                    if ( this._finished && new Date().getTime() - this._lastTime > 5*1000 ) {

                        this._finished = false;

                        console.log("Sitemap Starting");
                        this._generateSitemap();
                    }

                }catch(err){

                }

            }, 3000);

    }

    _generateSitemap(){

        // create generator
        this._generator = SitemapGenerator(consts.DOMAIN, {
            filepath: './public/sitemap.xml',
            maxEntriesPerFile: 50000,
            changeFreq: 'always',
            maxConcurrency: 1, //to avoid making the website run slow
        });

        // register event listeners
        this._generator.on('done', () => {

            // sitemaps created
            return this.sitemapCreated();

        });

        this._generator.on('error', (error) => {
            console.log(error);
            // => { code: 404, message: 'Not found.', url: 'http://example.com/foo' }
        });


        this._generator.start();
    }

    async sitemapCreated(){
        console.log("Sitemap finished");

        //pinging google
        if (!consts.DEBUG){
            const url = consts.DOMAIN+consts.PORT+'/public/sitemap.xml';
            console.log("Pinging google with sitemap", url);
            console.log('pinging request:', 'www.google.com/webmasters/tools/ping?sitemap='+encodeURI(url));
            await NetworkHelper.get('www.google.com/webmasters/tools/ping?sitemap='+encodeURI(url), );
        }

        this._lastTime = new Date().getTime();
        this._finished = true;
    }

    initExpress(app){


    }

}

export default new Sitemap();