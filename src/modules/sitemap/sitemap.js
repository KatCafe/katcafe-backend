import consts from 'consts/consts';

import SitemapGenerator from 'sitemap-generator';



class Sitemap{

    constructor(){

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

        // start the crawler
        this._generator.start();

    }

    sitemapCreated(){
        console.log("Sitemap finished");
    }

    initExpress(app){


    }

}

export default new Sitemap();