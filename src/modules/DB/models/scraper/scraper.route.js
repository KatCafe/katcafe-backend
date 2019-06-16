const cheerio = require('cheerio');

import NetworkHelper from "modules/helpers/network-helper"

export default function (express) {

    express.get('/scraper/*', async function(req, res ) {

        try{

            let uri = req.params[0];

            const html = NetworkHelper.get( uri, undefined, false, 10000 );

            const $ = cheerio.load( html );

            let title, description, image;

            title = $("meta[name='og:title']").attr("content");
            image = $("meta[name='og:image']").attr("content");
            description = $("meta[name='og:description']").attr("content");

            if (!title) title = $("meta[name='twitter:title']").attr("content");
            if (!image) image = $("meta[name='twitter:image']").attr("content");
            if (!description) description = $("meta[name='twitter:description']").attr("content");

            if ( !title && $("title").length ) title = $("title").text();
            if ( !title && $("h1").length ) title = $("h1").text();

            res.json( {

                result: true,

                scrape : {
                    title,
                    image,
                    description,
                }
            });

        }catch(err){
            res.status(500).json( err.toString() );
        }


    });

}