const sizeOf = require('image-size');
const cheerio = require('cheerio');

import StringHelper from "modules/helpers/string-helper";
import NetworkHelper from "modules/helpers/network-helper"

const timeout = 10000;

class ScraperController {


    async getImage(uri, timeout){

        try{

            let image = await NetworkHelper.get(uri,undefined, false, timeout, null);

            if (!image) return;

            image = Buffer.from(image);

            const size = await sizeOf(image);
            if (size && size.type !== "svg") {
                size.img = uri;
                return size;
            }
        }catch(err){
        }

    }

    async getYoutubePreview( id, timeout){

        let uri = 'https://www.youtube.com/results?search_query='+id;

        const html = await NetworkHelper.get( uri, undefined, false, timeout );
        const $ = cheerio.load( html );

        const scripts = $('script');

        const dataScript = scripts[scripts.length-3].children[0].data;

        let search = `"movingThumbnailDetails":{"thumbnails":[{"url":"`;
        let position = dataScript.indexOf(search);

        if (position >= 0 ) {
            let thumbnail = dataScript.substr(position + search.length);
            thumbnail = thumbnail.substr(0, thumbnail.indexOf(`","width":`));

            thumbnail = thumbnail.replace('\\u0026','&');
            thumbnail = thumbnail.replace('\\u0026','&');

            console.log(thumbnail);

            return {
                thumbnail: thumbnail,
                img: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            }
        }

    }

    async getPreview(uri, timeout){

        try{

            if (!uri) throw "invalid uri";
            uri = StringHelper.sanitizeText(uri);

            let image = await this.getImage(uri, timeout);

            if (image)
                return { image: image };

            const html = await NetworkHelper.get( uri, undefined, false, timeout );

            const $ = cheerio.load( html );

            let title, description;

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

            let youtubeId = '';
            if (uri.indexOf("youtube.com") >= 0 )
                youtubeId = uri.substr( uri.indexOf("watch?v=") + "watch?v=".length, 'fSqMpZ5qhz0'.length );
            else
            if (uri.indexOf("youtu.be") >= 0)
                youtubeId = uri.substr( uri.indexOf("youtu.be") + "youtu.be".length, 'fSqMpZ5qhz0'.length );

            if (youtubeId) {
                uri = 'https://youtube.com/watch?v=' + youtubeId;
                image = {
                    youtubeId: youtubeId,
                };
            }


            if (image && typeof image === "string") image = await this.getImage(image);
            if (image && typeof image === "object" ){

                if (image.img) image.img = await this.getImage(image.img);
                if (image.thumbnail) image.thumbnail = await this.getImage(image.thumbnail);

            }

            if (!title && !image && !description) throw "error";

            return {
                uri,
                title,
                description,
                image,
            }

        }catch(err){
            console.error("fetching error", err);
        }


    }

}

export default new ScraperController();