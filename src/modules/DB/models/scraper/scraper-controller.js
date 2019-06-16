const sizeOf = require('image-size');
const cheerio = require('cheerio');


import NetworkHelper from "modules/helpers/network-helper"

const timeout = 10000;

class ScraperController {


    async getImage(uri, timeout){

        let image = await NetworkHelper.get(uri,undefined, false, timeout, null);

        if (!image) return;

        try{

            image = Buffer.from(image);

            const size = await sizeOf(image);
            if (size) {
                size.img = uri;
                return size;
            }
        }catch(err){
        }

    }

    async getPreview(uri, timeout){

        try{

            let image = await this.getImage(uri, timeout);

            if (image)
                return { image: image };

            const html = await NetworkHelper.get( uri, undefined, false, timeout );

            const $ = cheerio.load( html );

            let title, description;

            title = $("meta[property='og:title']").attr("content");
            image = $("meta[property='og:image']").attr("content");
            description = $("meta[property='og:description']").attr("content");

            if (!title) title = $("meta[property='twitter:title']").attr("content");
            if (!image) image = $("meta[property='twitter:image']").attr("content");
            if (!description) description = $("meta[property='twitter:description']").attr("content");

            if (!title) title = $("meta[name='title']").attr("content");
            if (!image) image = $("meta[name='image']").attr("content");
            if (!description) description = $("meta[name='description']").attr("content");

            if ( !title && $("title").length ) title = $("title").text();
            if ( !title && $("h1").length ) title = $("h1").text();

            if (image && typeof image === "string")
                image = await this.getImage(image);

            if (!title && !image && !description) throw "error";

            return {
                title,
                description,
                image,
            }

        }catch(err){

        }


    }

}

export default new ScraperController();