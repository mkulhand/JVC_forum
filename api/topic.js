const express = require('./express')
const router = express.Router()
var mysql = require('mysql')
var db = require('./sql')
const util = require('./utility')
var Topic = require('./class/topic.class')
var Msg = require('./class/msg.class')
var User = require('./class/user.class')

/**----------------------------------\ ROUTE MAP /---------------------------------\
 * @name topic
 * GENERIC ROUTE ------------------------------------------------------------------\
 * @name getById	@path "/:id"	@method get
 * @name add		@path "/"		@method put
 * @name delete		@path "/:id"	@method delete
 * SPECIFIC ROUTE -----------------------------------------------------------------\
 * @name getFresh		@path "/fresh/:page"	@method get
 * @desc : récupère les topics par ordre du plus récemment actif
 **
 * @name getAllMsg		@path "/:id/msg"		@method get
 * @desc : récupère tout les message d'un topic
 **
 * @name getMsgPage		@path "/:id/:page"		@method get
 * @desc : récupère les messages de la page passée en paramètre 
 **
 * @name getTotalCount	@path "/count"			@method get
 * @desc : récupère le nombre de topic total 
 **
 * @name getMsgCount	@path "/:id/msgcount"	@method get
 * @desc : récupère le nombre de msg dans un topic 
\---------------------------------------------------------------------------------*/

/*
** MIDDLEWARE ------------------------------------------------------------------------------
*/

function checkDataForInsert(req, res, next) {
	let data = req.body
	if (!data.title || !req.user.id || !data.msg) {
		res.resp(403, errmsg.MISSING_DATA)
		return
	} else {
		if (data.msg.match(regex.string_blank)) {
			res.resp(403, errmsg.BLANK_STRING)
			return
		}
		if (data.msg.length > global.limit.msg) {
			res.resp(403, errmsg.LONG_STRING)
			return
		}
		if (data.title > global.limit.title) {
			res.resp(403, errmsg.LONG_STRING)
			return
		}
		let user = new User()
		user.import(req.user.id)
		.then((result) => {
			if (result.rank == -1)
				res.resp(403, errmsg.USER_BANNED)
			else
				next()
		})
		.catch((err) => {
			blacklist[req.user.jti] = req.user.exp
			res.resp(404, errmsg.ID_NOT_FOUND)
		})
	}
}

/*
** GENERIC ROUTES --------------------------------------------------------------------------
*/

router.get('/:id(\\d+)', (req, res) => {
	var topic = new Topic().import(req.params.id).then((result) => {
		if (result)
			res.resp(200, "", JSON.stringify(result))
		else
			res.resp(404, errmsg.ID_NOT_FOUND)
	}).catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR)
	})
})

router.put('/', checkDataForInsert, (req, res) => {
	var topic = new Topic({
		"title":		req.body.title,
		"author_id":	req.user.id
	})
	topic.insert()
	.then(async (topic_id) => {
		var msg = new Msg({
			"author_id":	req.user.id,
			"topic_id":		topic_id,
			"msg":			req.body.msg
		})
		await msg.insert()
		res.resp(201, actionmsg.TOPIC_ADDED, JSON.stringify(topic_id))
	})
	.catch((err) => {
		res.resp(404, errmsg.QUERY_ERROR)
	})
})

/*
** SPECIFIC ROUTE --------------------------------------------------------------------------
*/

/* récupère les topics par ordre du plus récemment actif une page = 25 topics */
router.get('/fresh/:page', (req, res) => {
	Topic.getLastUpdated(req.params.page).then((result) => {
		if (!result.length)
			res.resp(404, errmsg.NO_RESOURCE)
		else
			res.resp(200, "", result)
	}).catch((err) => {
		res.resp(401)
	})
})

/* récupère tout les message d'un topic */
router.get('/:id/msg', async (req, res) => {
	var topic = new Topic()
	await topic.import(req.params.id)
	topic.getAllMsg().then((result) => {
		if (result)
			res.resp(200, "", JSON.stringify(result))
		else
			res.resp(404, errmsg.ID_NOT_FOUND)
	}).catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR)
	})
})

/* récupère les messages de la page passée en paramètre */
router.get('/:id(\\d+)/:page(\\d+)', async (req, res) => {
	let topic = new Topic()
	topic.import(req.params.id).then((result) => {
		topic.getMsgPage(req.params.page).then((result) => {
			if (!result.length) {
				res.resp(417, errmsg.NO_RESOURCE)
			} else {
				result.push({ title: topic.title })
				res.resp(200, "", JSON.stringify(result))
			}
		}).catch(() => {
			res.resp(401, errmsg.QUERY_ERROR)
		})
	}).catch(() => {
		res.resp(404, errmsg.NO_RESOURCE)
	})
})

/* récupère le nombre de topic total */
router.get('/count', (req, res) => {
	Topic.getCount().then((result) => {
		res.resp(200, "", JSON.stringify(result))
	}).catch((err) => {
		res.resp(401)
	})
})

/* récupère le nombre de msg dans un topic  */
router.get('/:id/msgcount', (req, res) => {
	Topic.getMsgCount(req.params.id).then((result) => {
		res.resp(200, "", JSON.stringify(result))
	}).catch((err) => {
		res.resp(401)
	})
})

module.exports = router