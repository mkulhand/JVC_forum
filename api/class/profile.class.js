var db = require('../sql')
var mysql = require('mysql')
const util = require('../utility')
const Msg = require('./msg.class')

/**-----------------------------------\ CLASS /-----------------------------------\
 * @name profile
 * @desc : Gère les informations relatives à un compte utilisateur
 * @summary :
 * -------------------------------------------------------------------------------\
 * @param {String}	desc
 * @param {int}		age
 * @param {String}	country
 * @param {int}		gender
\--------------------------------------------------------------------------------*/

module.exports = class profile {

	constructor(detail = null) {
		if (detail) {
			this.id =		detail.id
			this.desc =		striptags(detail.desc, ['a', 'img'])
			this.age =		detail.age
			this.country =	detail.country
			this.gender =	detail.gender
		}
		return this
	}

	setDesc(val)	{ this.desc = val }
	setAge(val)		{ this.age = val }
	setCountry(val) { this.country = val }
	setGender(val)	{ this.gender = val }

	import(id) {
		return new Promise((resolve, reject) => {
			db.query('SELECT *, (SELECT COUNT(*) FROM msg WHERE author_id = ?) as "msgcount" FROM profile WHERE user_id = ?', [id, id],
			async (err, result) => {
				if (err)
					reject (err)
				else if (result.length) {
					this.id =				id
					let data = await this.getUserData()
					this.username =			data[0].username
					this.lastActif =		data[0].lastActif
					this.desc =				result[0].description
					this.age =				result[0].age
					this.country =			result[0].country
					this.msgcount =			result[0].msgcount
					this.gender =			result[0].gender
					let d1 = new Date(result[0].creation_date)
					let d2 = new Date()
					let timeDiff = Math.abs(d2.getTime() - d1.getTime())
					this.creation_date =	Math.ceil(timeDiff / (1000 * 3600 * 24))
					resolve(this)
				} else
					resolve()
			})
		})
	}

	getUserData() {
		return new Promise((resolve, reject) => {
			db.query('SELECT username, DATE_FORMAT(lastActif, "%d/%m/%Y") as lastActif FROM user WHERE id = ?', [this.id],
			(err, res) => {
				if (err || !res.length)
					reject(err)
				else
					resolve(res)
			})
		})
	}

	insert() {
		return new Promise((resolve, reject) => {
			db.query('INSERT INTO profile SET ?',
			{
				user_id:	this.id,
				description:this.desc,
				age:		this.age,
				country:	this.country,
				gender:		this.gender
			},
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result)
			})
		})
	}

	update() {
		return new Promise((resolve, reject) => {
			let query = 'UPDATE profile SET ? WHERE user_id = ?'
			query = mysql.format(query, [
				{
					user_id:	this.id,
					description:this.desc,
					age:		this.age,
					country:	this.country,
					gender:		this.gender
				},
				[this.id]
			])
			db.query(query,
				(err, result) => {
					if (err)
						reject (err)
					else
						resolve(result)
				})
		})
	}

	delete(id) {
		return new Promise((resolve, reject) => {
			db.query('DELETE FROM profile WHERE user_id = ?', [id],
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result)
			})
		})
	}
}