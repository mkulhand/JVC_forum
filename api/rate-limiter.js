const rateLimit = require("express-rate-limit");

module.exports.putLimitReq = rateLimit({
	windowMs: 10000, // 10 secondes
	max: 1, // limit each IP to 5 requests per windowMs
});

module.exports.limitAuth = rateLimit({
	windowMs: 1 * 60 * 1000, // 1mn
	max: 5, // limit each IP to 5 requests per windowMs
	message: "Trop de tentative de connexion, veuillez patienter environ 1 minute."
});

module.exports.limitPutUser = rateLimit({
	windowMs: 60 * 60 * 1000, // 1H
	max: 5, // limit each IP to 5 requests per windowMs
	message: "Création de compte limitée à 5 par heure..."
})


