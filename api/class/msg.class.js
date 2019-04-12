var db = require('../sql')
var mysql = require('mysql')
const util = require('../utility')
const striptags = require('striptags')

/**-----------------------------------\ CLASS /-----------------------------------\
 * @name msg
 * @desc : Gère les actions lié aux messages
 * @summary :
 * -------------------------------------------------------------------------------\
 * @param {int}		author_id
 * id de l'auteur du message
 * @param {int}		topic_id
 * id du topic
 * @param {String}	msg
\--------------------------------------------------------------------------------*/

module.exports = class msg {

	constructor(detail = null) {
		if (detail) {
			this.author_id =	detail.author_id
			this.topic_id =		detail.topic_id
			this.msg =			striptags(detail.msg, ['a', 'img'])
		}
		return this
	}

	import(id) {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM msg WHERE ? ", { id: id },
			(err, result) => {
				if (err)
					reject(err)
				else {
					if (result.length) {
						this.author_id =	result[0].author_id
						this.topic_id =		result[0].topic_id
						this.msg =			result[0].msg
						this.datetime =		result[0].date
						resolve(this)
					} else
						reject()
				}
			})
		})
	}

	insert() {
		return new Promise((resolve, reject) => {
			db.query('INSERT INTO msg SET ?',
			{
				author_id:	this.author_id,
				topic_id:	this.topic_id,
				text:		this.msg,
				date:		util.getTimestamp()
			},
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result.insertId)
			})
		})
	}

	delete(id) {
		return new Promise((resolve, reject) => {
			db.query('DELETE FROM msg WHERE ?', {id: id},
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result)
			})
		})
	}
}