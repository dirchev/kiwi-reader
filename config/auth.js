// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : process.env.FACEBOOK_CLIENT_ID, // your App ID
        'clientSecret'  : process.env.FACEBOOK_CLIENT_SECRET, // your App Secret
        'callbackURL'   : 'https://kiwi-reader.herokuapp.com/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : process.env.TWITTER_CONSUMER_KEY,
        'consumerSecret'    : process.env.TWITTER_CONSUMER_SECRET,
        'callbackURL'       : 'https://kiwi-reader.herokuapp.com/auth/twitter/callback'
    },

    // 'googleAuth' : {
    //     'clientID'      : 'your-secret-clientID-here',
    //     'clientSecret'  : 'your-client-secret-here',
    //     'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    // }

};
