import consts from 'consts/consts';

import SitemapGenerator from 'sitemap-generator';
import NetworkHelper from "modules/helpers/network-helper"

const start = consts.SITEMAP;

class Sitemap{

    constructor(){

        this._lastTime = 0;
        this._finished = true;

        // start the crawler
        if (start){
            
            console.log("Sitemap Starting");
            // create generator
            this._generator = SitemapGenerator(consts.DOMAIN, {
                filepath: './public/sitemap.xml',
                maxEntriesPerFile: 50000,
                changeFreq: 'always',
                maxConcurrency: 1, //to avoid making the website run slow
            });
           
            this._generateSitemap();
        }
        
    }

    _generateSitemap(){
        
        this._finished = false;

        // register event listeners
        this._generator.on('done', () => {

            // sitemaps created_generateSitemap
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
            const url = consts.DOMAIN+':'+consts.PORT+'/public/sitemap.xml';
            console.log("Pinging google with sitemap", url);
            console.log('pinging request:', 'https://www.google.com/ping?sitemap='+encodeURI(url));
            await NetworkHelper.get('https://www.google.com/ping?sitemap='+encodeURI(url), );
        }

        this._lastTime = new Date().getTime();
        this._finished = true;
        
        setTimeout( () => this._generateSitemap(), 5*60*1000 );       
    }

    initExpress(app){


    }

}

export default new Sitemap();
