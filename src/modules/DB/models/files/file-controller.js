const path = require('path');
const sharp = require('sharp');

import client from "modules/DB/redis"

import StringHelper from "modules/helpers/string-helper";
import CryptoHelper from "modules/helpers/crypto-helper";

import FileClass from "./file";

class FileController{

    decodeBase64Image(dataString) {

        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        var response = {};

        if (matches.length !== 3)
            return new Error('Invalid input string');


        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    }

    async processUploadedBase64File(file, res1 = 800, res2 = 200){
        const extension = path.extname(file.name).toLowerCase();

        if ( ['.jpg','.jpeg','.gif','.png','.tiff'].indexOf(extension) < 0 ) throw "invalid image extension";

        file.name = StringHelper.removeWhiteSpace(file.name).replace('/\\,;[](){}~!@#$%^&**()','');

        if ( !file.base64 || file.base64.length < 10) throw "invalid base64 file";

        const data = this.decodeBase64Image( file.base64 );
        file.mime = data.type;
        file.base64 = data.data;
        file.buffer = Buffer.from(file.base64, "base64");

        file.sha256 = CryptoHelper.sha256( file.buffer ).toString("hex").toLowerCase();

        let fileModel;

        const out = await client.hexistsAsync('files:hash', file.sha256);
        if (out === 1){

            const slug = await client.hgetAsync('files:hash', file.sha256);
            fileModel = new FileClass( slug, );
            await fileModel.load();

        } else {

            const slug = '0_'+file.name;
            fileModel = new FileClass(  );
            let prefix = '';
            do{
                fileModel.slug = slug + prefix;
                prefix = StringHelper.makeId(20 );
            }while( fileModel.load() === true )

            const resizedSlug = '/public/images/'+ path.parse( fileModel.slug).name+'_'+res1+extension;
            const resized = await this.resizeFile( global.appRoot + resizedSlug, file.buffer, res1 );

            const thumbnailSlug = '/public/images/'+ path.parse( fileModel.slug).name+'_'+res2+extension;
            const thumbnail = await this.resizeFile(global.appRoot + thumbnailSlug, file.buffer, res2 );

            fileModel = new FileClass( fileModel.slug, file.mime, {
                img: thumbnailSlug,
                width: thumbnail.width,
                height: thumbnail.height,
            }, file.title, file.sha256, {
                img: resizedSlug,
                width: resized.width,
                height: resized.height,
            }, new Date().getTime() );

            console.log(fileModel.toJSON() );

            await fileModel.save();

        }

        return fileModel.slug;

    }

    async resizeFile(filename, buffer, maxDimm){

        return sharp(buffer).resize( maxDimm, maxDimm, { fit: 'inside', withoutEnlargement: true }  ).toFile(filename);

    }

}

export default new FileController();