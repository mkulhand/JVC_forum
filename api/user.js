require('dotenv').config({path: 'settings.env'})
const express = require('./express')
const router = express.Router()
const passwordHash = require('password-hash')
var db = require('./sql')
var jwt = require('jsonwebtoken')
const util = require('./utility')
var User = require('./class/user.class')
var Profile = require('./class/profile.class')
const rateLimit = require("./rate-limiter");

/**----------------------------------\ ROUTE MAP /---------------------------------\
 * @name user
 * GENERIC ROUTE ------------------------------------------------------------------\
 * @name getById	@path "/:id"	@method get
 * @name add		@path "/"		@method put
 * @name delete		@path "/:id"	@method delete
 * SPECIFIC ROUTE -----------------------------------------------------------------\
 * @name pswdUpdate		@path "/password"	@method post
 * @desc : change le mot de passe
 **
 * @name authenticate	@path "/auth"		@method post
 * @desc : authentifie un utilisateur
\---------------------------------------------------------------------------------*/

/*
** MIDDLEWARE ------------------------------------------------------------------------------
*/

async function addUser(req, res, next) {
	let data = req.body
	if (!data.username || !data.password) {
		res.resp(403, errmsg.MISSING_DATA);
		return
	}
	let prom = await checkForDuplicate(data.username)
	if (prom.length) {
		res.resp(403, errmsg.DUPLICATE_USERNAME);
		return
	}
	if (data.username.match(regex.username) === null) {
		res.resp(403, errmsg.BAD_FORMAT);
		return
	}
	if (data.password.match(regex.password) === null) {
		res.resp(403, errmsg.BAD_FORMAT);
		return
	}
	else
		next()
}


/*
** GENERIC ROUTES --------------------------------------------------------------------------
*/

router.get('/:id(\\d+)', (req, res) => {
	let user = new User()
	user.import(req.params.id)
	.then((result) => {
		res.resp(200, "", JSON.stringify(result))
	})
	.catch((err) => {
		res.resp(404, errmsg.ID_NOT_FOUND)
	})
})

router.put('/', addUser, rateLimit.limitPutUser, (req, res) => {
	let hashedPassword = passwordHash.generate(req.body.password, {algorithm: 'sha256'})
	let user = new User({
		username:	req.body.username,
		password:	hashedPassword,
		rank:		0
	})
	user.insert().then((result) => {
		let profile = new Profile({
			"id":		result,
			"desc":		"",
			"age":		0,
			"country":	"",
			"gender":	0
		})
		profile.insert().then((result) => {
			res.resp(201, actionmsg.USER_ADDED)
		}).catch((err) => {
			res.resp(401, errmsg.QUERY_ERROR, err)
		})
	}).catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR, err)
	})
})

/*
** SPECIFIC ROUTE --------------------------------------------------------------------------
*/

/* change le mot de passe */
router.post('/password', async (req, res) => {
	let hashedPassword = passwordHash.generate(req.body.password, {algorithm: 'sha256'})
	let user = new User()
	await user.import(req.body.id)
	await user.setPassword(hashedPassword)
	user.update().then((result) => {
		res.resp(200, actionmsg.USER_PASSWORD_UPDATED)
	}).catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR, err)
	})
})

/* authentifie un utilisateur */
router.post('/auth', rateLimit.limitAuth, (req, res) => {
	let user = new User({
		username:	req.body.username,
		password:	req.body.password,
		ip:			req.connection.remoteAddress
	})
	user.authenticate(req.body.username).then((result) => {
		res.resp(200, actionmsg.USER_AUTH, {'token': result})
	}).catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR, err)
	})
})

/*
** LOCAL FUNCTIONS --------------------------------------------------------------------------
*/

/* recherche si un username existe déjà en BDD */
function checkForDuplicate(username) {
	return new Promise((resolve, reject) => {
		db.query("SELECT username FROM user WHERE username LIKE ?", [username],
		(err, result) => {
			if (err)
				reject(err)
			else
				resolve(result)
		})
	})
}

module.exports = router