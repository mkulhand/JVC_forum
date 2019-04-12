const express = require('./express')
const router = express.Router()
var db = require('./sql')
const util = require('./utility')
var Topic = require('./class/topic.class')
var Msg = require('./class/msg.class')

/**----------------------------------\ ROUTE MAP /---------------------------------\
 * @name msg
 * GENERIC ROUTE ------------------------------------------------------------------\
 * @name getById	@path "/:id"	@method get
 * @name add		@path "/"		@method put
 * @name delete		@path "/:id"	@method delete
\---------------------------------------------------------------------------------*/

/*
** MIDDLEWARE ------------------------------------------------------------------------------
*/

function checkDataForInsert(req, res, next) {
	let data = req.body
	if (!req.user.id || !data.topic_id || !data.msg) {
		res.resp(403, errmsg.MISSING_DATA)
	} else {
		if (data.msg.match(regex.string_blank)) {
			res.resp(403, errmsg.BLANK_STRING)
		}
		if (data.msg.length > global.limit.msg) {
			res.resp(403, errmsg.LONG_STRING)
		}
	}
	let topic = new Topic()
	topic.import(data.topic_id)
	.then((result) => {
		if(topic.status == 1 || topic.status == 3) {
			res.resp(423, errmsg.ARCHIVED_TOPIC)
		} else
			next()
	})
	.catch((err) => {
		res.resp(404, errmsg.ID_NOT_FOUND)
	})
}

/*
** GENERIC ROUTES --------------------------------------------------------------------------
*/

router.get('/:id(\\d+)', (req, res) => {
	let msg = new Msg().import(req.params.id)
	.then((result) => {
		if (result)
			res.resp(200, "", JSON.stringify(result))
		else
			res.resp(404, errmsg.ID_NOT_FOUND)
	})
	.catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR, err)
	})
})

router.put('/', checkDataForInsert, async (req, res) => {
	let msg = new Msg({
		"author_id":	req.user.id,
		"topic_id":		req.body.topic_id,
		"msg":			req.body.msg
	})
	msg.insert()
	.then( async () => res.resp(201, actionmsg.MSG_ADDED, await Topic.getMsgCount(req.body.topic_id)))
	.catch((err) => res.resp(403, errmsg.QUERY_ERROR, err))
})

module.exports = router