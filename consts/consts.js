const debug = true;

export default {

    DEBUG: debug,
    PORT: debug ? 8085 : 2096,
    DOMAIN: debug ? "http://127.0.0.1:8080" : "https://katcafe.org",

    SITEMAP: debug ? false : true,

};
