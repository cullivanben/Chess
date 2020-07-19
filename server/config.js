require('dotenv/config');

const port = process.env.PORT || 5000;
const baseURL = `http://localhost:${port}`;

module.exports = {
    baseURL: baseURL,
    port: port,
    secret: {
        cookie: process.env.COOKIE_SECRET
    }
}