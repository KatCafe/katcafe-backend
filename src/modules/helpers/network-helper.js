const rp = require('request-promise');

class NetworkHelper {

    async post( uri, body, json = true, timeout ){

        return rp({
            uri: uri,
            headers: { 'User-Agent': 'Request-Promise' },
            json: json,
            timeout: timeout,
            method: "POST",
            body: body
        });

    }

    async get( uri, body, json = true, timeout){

        return rp({
            uri: uri,
            headers: { 'User-Agent': 'Request-Promise' },
            json: json,
            timeout: timeout,
            body: body,
        });

    }

}

export default new NetworkHelper();