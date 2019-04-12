const express = require('./express')
const router = express.Router()
var mysql = require('mysql')
var db = require('./sql')
const util = require('./utility')
var Profile = require('./class/profile.class')

/*
** MIDDLEWARE ------------------------------------------------------------------------------
*/

function checkBeforeUpdate(req, res, next) {
	if (req.body.desc.length > limit.desc || (req.body.age > 130 || req.body.age < 0)) {
		res.resp(401, errmsg.INCORRECT_DATA)
	} else
		next()
}

/*
** GENERIC ROUTES --------------------------------------------------------------------------
*/

/*
get by id
*/
router.get('/:id(\\d+)', (req, res) => {
	let profile = new Profile().import(req.params.id)
	.then((result) => {
		if (result)
			res.resp(200, "", JSON.stringify(result, null, 4))
		else
			res.resp(404, errmsg.ID_NOT_FOUND)
	})
	.catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR, err)
	})
})

/*
modify ressource
*/
router.post('/update', checkBeforeUpdate, async (req, res) => {
	let profile = new Profile()
	await profile.import(req.user.id)
	profile.setDesc(req.body.desc)
	profile.setAge(req.body.age)
	profile.setCountry(req.body.country)
	profile.setGender(req.body.gender)
	profile.update().then((result) => {
		res.resp(200, actionmsg.PROFILE_UPDATED)
	}).catch((err) => {
		res.resp(401, errmsg.QUERY_ERROR, err)
	})
})

module.exports = router
