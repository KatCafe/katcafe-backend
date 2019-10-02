import consts from 'consts/consts';

import SitemapGenerator from 'sitemap-generator';

const start = false;

class Sitemap{

    constructor(){

        this._lastTime = 0;
        this._finished = true;

        // start the crawler
        if (start)
            setInterval( ()=>{

                try{

                    if ( this._finished && new Date().getTime() - this._lastTime > 30*60*1000 ) {

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
        this._generator = SitemapGenerator(consts.domain, {
            filepath: './public/sitemap.xml',
            maxEntriesPerFile: 50000,
            changeFreq: 'always',
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


        this._generator.start();
    }

    sitemapCreated(){
        console.log("Sitemap finished");

        this._lastTime = new Date().getTime();
        this._finished = true;
    }

    initExpress(app){


    }

}

export default new Sitemap();