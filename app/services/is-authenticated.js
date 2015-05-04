var jwt = require('jsonwebtoken');

module.exports = function(app){
	return function (req, res, next) {
		// check header or url parameters or post parameters for token
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
	
		// decode token
		if (token) {
	
			// verifies secret and checks exp
			jwt.verify(token, app.get('superSecret'), function (err, decoded) {
				if (err) {
					return res.json({ success: false, message: 'Не успяхме да Ви идентифицираме.' });
				} else {
					// if everything is good, save to request for use in other routes
					req.user = decoded;
					// req.user
					next();
				}
			});
	
		} else {
			// if there is no token
			// return with an error
			return res.status(403).send({	
				success: false,
				message: 'Не успяхме да Ви идентифицираме.'
			});
	
		}
	};
}