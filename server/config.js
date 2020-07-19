require('dotenv/config')
const port = process.env.PORT || 5000;
const baseURL = `http://localhost:${port}`;
module.exports = {
    // secret key for jsonwebtoken encryption
    JWTsecret: process.env.JWT_SECRET,
    baseURL: baseURL,
    port: port,
    // the credentials and information for OAuth2
    oauth2Credentials: {
        client_id: process.env.CLIENT_ID,
        project_id: "Live Chess",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: process.env.CLIENT_SECRET,
        redirect_uris: [`${baseURL}/auth_callback`],
        scopes: ['https://www.googleapis.com/auth/youtube.readonly']
    }
}