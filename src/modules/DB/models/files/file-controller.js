const path = require('path');
const sharp = require('sharp');
const fs = require('fs')

import client from "modules/DB/redis"

import StringHelper from "modules/helpers/string-helper";
import CryptoHelper from "modules/helpers/crypto-helper";

import FileClass from "./file";

class FileController{

    decodeBase64Image(dataString) {

        const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const response = {};

        if (matches.length !== 3)
            return new Error('Invalid input string');


        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64');

        return response;
    }

    async processUploadedBase64File(file, res1 = 800, res2 = 200){

        file.name = StringHelper.sanitizeText(file.name);

        const extension = path.extname(file.name).toLowerCase();

        if ( ['.jpg','.jpeg','.gif','.png','.tiff'].indexOf(extension) < 0 ) throw "invalid image extension";

        file.name = file.name.replace('/\\,;[](){}~!@#$%^&**()','');

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

            fileModel.used += 1;
            await fileModel.save();

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

            fileModel = new FileClass( resizedSlug, file.mime, {
                img: thumbnailSlug,
                width: thumbnail.width,
                height: thumbnail.height,
            }, file.title, file.sha256, {
                width: resized.width,
                height: resized.height,
            }, 1, new Date().getTime() );


            await fileModel.save();

        }

        return fileModel;

    }

    async resizeFile(filename, buffer, maxDimm){

        return sharp(buffer).resize( maxDimm, maxDimm, { fit: 'inside', withoutEnlargement: true }  ).toFile(filename);

    }

    async deleteFile(sha256){

        const slug = await client.hgetAsync('files:hash', sha256);
        if (slug){
            const fileModel = new FileClass( slug, );
            await fileModel.load();

            fileModel.used -= 1;

            if (fileModel.used === 0) {

                try {
                    await fs.unlinkSync(global.appRoot + fileModel.slug );
                    await fs.unlinkSync(global.appRoot + fileModel.preview.img);
                }catch(err){
                    console.error("Error deleting files", error);
                }

                await fileModel.delete();
            }

        }

    }

}

export default new FileController();