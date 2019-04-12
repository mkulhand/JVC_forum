require('dotenv').config({path: 'settings.env'})
const express = require('./express')
const user = require('./user')
const topic = require('./topic')
const msg = require('./msg')
const profile = require('./profile')
const admin = require('./admin')
const fs = require('fs')
const https = require('https')
const app = express()
const bp = require('body-parser')
const jwtMiddleware = require('express-jwt')

global = require('./global')

var allowCrossDomain, server

function isRevokedCallback(req, payload, done){
	if (blacklist[payload.jti])
	return done(null, true)
	else
	return done(null, false)
}

if (process.env.PRODUCTION === "1") {
	allowCrossDomain = function(req, res, next) {
		let origin = req.get('origin')
		if (typeof origin !== "undefined" && origin.match(/(?<=https:\/\/)(www\.discussionlibre\.com|discussionlibre\.com)/gmi))
		res.header('Access-Control-Allow-Origin', origin)
		else
		res.header('Access-Control-Allow-Origin', 'https://www.discussionlibre.com')
		res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
		res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With')
		res.header('Access-Control-Allow-Credentials', true)
		next()
	}
} else {
	allowCrossDomain = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', "http://localhost:4200")
		res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
		res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With')
		res.header('Access-Control-Allow-Credentials', true)
		next()
	}
}

app.use(bp.json())
app.use(bp.urlencoded({extended: true}))
app.use(allowCrossDomain)

app.use(jwtMiddleware({
	secret: process.env.SECRET,
	getToken: function (req) {
		if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
			return req.headers.authorization.split(' ')[1]
		} else if (req.query && req.query.token) {
			return req.query.token
		} else
			return null
	},
	isRevoked: isRevokedCallback
}).unless({
	path: [
		'/user/auth',
		'/user',
		{ url: '/user', methods: ["GET", "PUT"] },
		{ url: /^\/user\/[\d]{1,}$/gmi, methods: ["GET"] },
		{ url: '/topic', methods: ["GET"] },
		{ url: /\/topic\/[\d]+\/[\d]+/gi, methods: ["GET"] },
		{ url: /^\/topic\/([\d]{1,}|fresh\/[\d]{1,}|count|[\d]+\/msgcount)$/gi, methods: ["GET"] },
		{ url: '/msg', methods: ["GET"] },
		{ url: /^\/msg\/[\d]{1,}$/gmi, methods: ["GET"] },
	]
}))


app.use('/user', user)
app.use('/topic', topic)
app.use('/msg', msg)
app.use('/profile', profile)
app.use('/admin', admin)
app.get('/logout', (req, res) => {
	blacklist[req.user.jti] = req.user.exp
	res.resp(200, actionmsg.USER_LOGOUT)
})

if (process.env.PRODUCTION === "1") {
	httpsOption = {
		cert: fs.readFileSync("/etc/letsencrypt/live/www.discussionlibre.com/fullchain.pem"),
		key: fs.readFileSync("/etc/letsencrypt/live/www.discussionlibre.com/privkey.pem")
	}
	server = https.createServer(httpsOption, app)
	server.listen(process.env.PORT, () => console.log("Server listening on port " + process.env.PORT))
} else {
	app.listen(process.env.PORT, () => console.log('Server is running on port ' + process.env.PORT))
}
