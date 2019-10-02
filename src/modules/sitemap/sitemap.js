import consts from 'consts/consts';

import SitemapGenerator from 'sitemap-generator';


class Sitemap{

    constructor(){

        this._lastTime = 0;
        this._finished = true;

        // create generator
        this._generator = SitemapGenerator(consts.domain, {
            filepath: './public/sitemap.xml',
            maxEntriesPerFile: 50000,
            changeFreq: 'always',
            maxConcurrency: 1,
        });

        // register event listeners
        this._generator.on('done', () => {

            // sitemaps created
            this.sitemapCreated();
        });

        this._generator.on('error', (error) => {
            console.log(error);
            // => { code: 404, message: 'Not found.', url: 'http://example.com/foo' }
        });

        // start the crawler
        setInterval( ()=>{

            if ( this._finished && new Date().getTime() - this._lastTime > 60*1000 ) {
                this._finished = false;

                console.log("Sitemap Starting");
                this._generator.start();
            }

        }, 3000);

    }

    sitemapCreated(){
        this._finished = true;
        console.log("Sitemap finished");
    }

    initExpress(app){


    }

}

export default new Sitemap();