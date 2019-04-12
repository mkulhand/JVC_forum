const express = require('./express')
const router = express.Router()
var mysql = require('mysql')
var db = require('./sql')
const util = require('./utility')
var Topic = require('./class/topic.class')
var User = require('./class/user.class')
var Profile = require('./class/profile.class')
var Msg = require('./class/msg.class')


function allowAdmin(req, res, next) {
	if (!req.hasOwnProperty('user') || !req.user.hasOwnProperty('ip') || req.user.ip != req.connection.remoteAddress)
		res.resp(403, errmsg.INVALID_TOKEN)
	else
		next()
}


router.post('/topic/setStatus', allowAdmin, (req, res) => {
	let topic = new Topic()
	topic.import(req.body.id)
	.then((result) => {
		topic.setStatus(req.body.status)
		topic.update()
		.then((result) => {
			res.resp(200, actionmsg.TOPIC_UPDATED)
		})
		.catch((err) => {
			res.resp(401, errmsg.QUERY_ERROR)
		})
	})
	.catch((err) => {
		res.resp(404, errmsg.ID_NOT_FOUND)
	})
})

router.post('/user/setRank', allowAdmin, async (req, res) => {
	let user = new User()
	user.import(req.body.id)
	.then( async (result) => {
		user.setRank(req.body.rank)
		await user.update()
		res.resp(200, actionmsg.USER_UPDATED)
	})
	.catch((err) => {
		res.resp(404, errmsg.ID_NOT_FOUND)
	})
})

router.delete('/user', allowAdmin, (req, res) => {
	let user = new User()
	user.delete(req.body.id)
	.then((result) => {
		if (result) {
			new Profile().delete(req.body.id)
			.then((result) => {
				res.resp(200, actionmsg.USER_DELETED)
			})
			.catch((err) => {
				res.resp(401, errmsg.QUERY_ERROR, err)
			})
		}
		else
			res.resp(404, errmsg.ID_NOT_FOUND)
	})
	.catch((err) => {
		res.resp(404, errmsg.ID_NOT_FOUND)
	})
})

router.delete('/topic', allowAdmin, (req, res) => {
	new Topic().delete(req.body.id)
	.then((result) => {
		if (result.affectedRows)
			res.resp(200, actionmsg.TOPIC_DELETED)
		else
			res.resp(404, errmsg.ID_NOT_FOUND)
	})
	.catch(() => {
		res.resp(404, errmsg.QUERY_ERROR)
	})
})

router.delete('/msg', allowAdmin, (req, res) => {
	new Msg().delete(req.body.id)
	.then((result) => {
		if (result.affectedRows)
			res.resp(200, actionmsg.MSG_DELETED)
		else
			res.resp(404, errmsg.ID_NOT_FOUND)
	})
	.catch((err) => {
		res.resp(404, errmsg.QUERY_ERROR)
	})
})

module.exports = router