// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '485936691536149', // your App ID
        'clientSecret'  : '5fa7250632139239e47807f72738816b', // your App Secret
        'callbackURL'   : 'https://kiwi-reader.herokuapp.com/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'       : 'QHZyaDUTWjuDRrDjRkKT1myfS',
        'consumerSecret'    : 'iOR20ziG4VpBazRCve4ZaBHudFgR6N1Vqsky5b7lEwUdLbOszp',
        'callbackURL'       : 'https:/kiwi-reader.herokuapp.com/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    }

};
