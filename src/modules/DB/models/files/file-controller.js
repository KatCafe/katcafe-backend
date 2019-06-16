const path = require('path');
const sharp = require('sharp');

import client from "modules/DB/redis"

import StringHelper from "modules/helpers/string-helper";
import CryptoHelper from "modules/helpers/crypto-helper";

import File from "./file";

class FileController{

    async processUploadedBase64File(file){

        const extension = path.extname(file.name).toLowerCase();

        if ( ['.jpg','.jpeg','.gif','.png','.tiff'].indexOf(extension) < 0 ) throw "invalid image extension";

        file.name = StringHelper.removeWhiteSpace(file.name).replace('/\\,;[](){}~!@#$%^&**()','');

        if ( !file.base64 || file.base64.length < 10) throw "invalid base64 file";

        file.base64 = file.base64.substr(file.base64.indexOf(',/' )+2);
        file.buffer = Buffer.from(file.base64, "base64");

        file.sha256 = CryptoHelper.sha256( file.buffer ).toString("hex").toLowerCase();

        let fileModel;

        const out = await client.hexistsAsync('files:hash', file.sha256);
        if (out === 1){

            const slug = await client.hgetAsync('files:hash', file.sha256);
            fileModel = new File( slug, );
            await fileModel.load();

        } else {

            const resized = await this.resizeFile(file.buffer, 1500 );
            const thumbnail = await this.resizeFile(resized, 300 );

            fileModel = new File( file.name, file.mime, undefined, file.title, file.sha256, undefined, new Date().getTime() );
            await fileModel.save();

        }

        return fileModel.slug;

    }

    async resizeFile(buffer, maxDimm){

        return sharp(buffer).resize(maxDimm).toBuffer();

    }

}

export default new FileController();