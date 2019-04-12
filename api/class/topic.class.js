var db = require('../sql')
var mysql = require('mysql')
const util = require('../utility')

/**-----------------------------------\ CLASS /-----------------------------------\
 * @name topic
 * @desc : Gère les requêtes relatives au topic
 * @summary :
 * -------------------------------------------------------------------------------\
 * @param {String}	title
 * @param {int}		author_id
 * @param {int}		status
\--------------------------------------------------------------------------------*/

module.exports = class topic {

	constructor(detail = null) {
		if (detail) {
			this.title =		detail.title
			this.author_id =	detail.author_id
			this.status =		0
		}
		return this
	}

	setStatus(status) { this.status = status }

	import(id) {
		return new Promise((resolve, reject) => {
			db.query("SELECT * FROM topic WHERE ?", {id: id},
			(err, result) => {
				if (err)
					reject(err)
				else if (result.length) {
					this.id =			id
					this.title =		result[0].title
					this.author_id =	result[0].author_id
					this.date_created = result[0].date_created
					this.status =		result[0].status
					resolve (this)
				} else
					reject()
			})
		})
	}

	insert() {
		return new Promise((resolve, reject) => {
			let datetime = util.getTimestamp()
			db.query('INSERT INTO topic SET ?',
			{
				title:			this.title,
				author_id:		this.author_id,
				date_created:	datetime,
				status:			this.status
			},
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result.insertId)
			})
		})
	}

	update() {
		return new Promise((resolve, reject) => {
			let query = "UPDATE topic SET ? WHERE ?"
			query = mysql.format(query, [
				{
					title:			this.title,
					author_id:		this.author_id,
					date_created:	this.date_created,
					status:			this.status
				},
				{ id: this.id }
			])
			db.query(query,
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result)
			})
		})
	}

	delete(id) {
		id = parseInt(id)
		return new Promise((resolve, reject) => {
			db.query('DELETE FROM topic WHERE ?', {id: id},
			(err, result) => {
				if (err)
					reject(err)
				else {
					this.deleteMsg(id)
					.then(() => {
						resolve(result)
					})
					.catch((err) => {
						reject(err)
					})
				}
			})
		})
	}

	deleteMsg(id) {
		return new Promise((resolve, reject) => {
			db.query('DELETE FROM msg WHERE topic_id = ?', [id],
			(err, res) => {
				if (err)
					reject(err)
				else
					resolve()
			})
		})
	}

	/**-----------------------------------\ METHOD /----------------------------------\
	 * @name getAllMsg
	 * @desc : Récupère tout les messages du topic
	 * -------------------------------------------------------------------------------\
	 * @param
	 * -------------------------------------------------------------------------------\
	 * @return promise - json object
	\--------------------------------------------------------------------------------*/

	getAllMsg() {
		return new Promise((resolve, reject) => {
			db.query('SELECT * FROM msg WHERE ?', {topic_id: this.id},
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result)
			})
		})
	}

	/**-----------------------------------\ METHOD /----------------------------------\
	 * @name getMsgPage
	 * @desc : Récupère les messages spécifique à une page
	 * -------------------------------------------------------------------------------\
	 * @param {int} page
	 * le numéro de la page
	 * -------------------------------------------------------------------------------\
	 * @return promise - json object
	 * toute les infos des msgs + l'username et le rang de l'user
	\--------------------------------------------------------------------------------*/

	getMsgPage(page) {
		return new Promise((resolve, reject) => {
			let limit = page * 20
			let query = "SELECT msg.*, user.username, user.rank FROM msg LEFT JOIN user ON msg.author_id = user.id WHERE topic_id = ? ORDER BY date ASC limit ?, ?"
			query = mysql.format(query,[
				this.id,
				limit,
				20
			])
			db.query(query,
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result)
			})
		})
	}

	/*
	** STATIC FUNCTIONS --------------------------------------------------------------------------
	*/

	/**-----------------------------------\ METHOD /----------------------------------\
	 * @name getCount
	 * @desc : Renvoi le nombre total de topic
	 * -------------------------------------------------------------------------------\
	 * @param 
	 * -------------------------------------------------------------------------------\
	 * @return {int} count
	\--------------------------------------------------------------------------------*/

	static getCount() {
		return new Promise((resolve, reject) => {
			db.query('SELECT COUNT(*) as "count" FROM topic',
			(err, result) => {
				if (err)
					reject(err)
				else
					resolve(result[0])
			})
		})
	}

	/**-----------------------------------\ METHOD /----------------------------------\
	 * @name getLastUpdated
	 * @desc : Récupère les topics par ordre du plus récent
	 * prend en compte les topics archivés, épinglés en faisant appel à @name getPinned
	 * envoi également l'username/rank de l'auteur du topic
	 * -------------------------------------------------------------------------------\
	 * @param {int} page
	 * -------------------------------------------------------------------------------\
	 * @return promise - json object
	\--------------------------------------------------------------------------------*/

	static getLastUpdated(page) {
		page = parseInt(page)
		return new Promise(async (resolve, reject) => {
			let pinned = await this.getPinned(page)
			let pinnedOffset = await this.getStartingOffset()
			let pinnedFloored = Math.floor(pinnedOffset / 25)
			let offset = 0
			if (page > pinnedFloored)
				offset = ((page - pinnedFloored) * 25) - pinned.length
			if (page > pinnedFloored)
				offset = (page * 25) - pinnedOffset
			let limit = 26 - pinned.length
			if (limit <= 0)
				resolve(pinned)
			let query = "SELECT topic.status, topic.id, topic.title, user.username, user.rank, (SELECT MAX(DATE) FROM msg WHERE msg.topic_id = topic.id) AS 'last_updated', ( SELECT COUNT(*) FROM msg WHERE topic.id = msg.topic_id ) AS 'msg_count' FROM topic LEFT JOIN user ON topic.author_id = user.id WHERE topic.status < 2 ORDER BY last_updated DESC LIMIT ?, ?"
			query = mysql.format(query, [
				offset,
				limit
			])
			db.query(query,
				(err, result) => {
					if (err)
						reject(err)
					else
						resolve(pinned.concat(result))
				})
		})
	}

	static getPinned(page) {
		return new Promise((resolve, reject) => {
			let offset = page * 25
			let query = "SELECT topic.status, topic.id, topic.title, user.username, user.rank, (SELECT MAX(DATE) FROM msg WHERE msg.topic_id = topic.id) AS 'last_updated', ( SELECT COUNT(*) FROM msg WHERE topic.id = msg.topic_id ) AS 'msg_count' FROM topic LEFT JOIN user ON topic.author_id = user.id WHERE topic.status >= 2 ORDER BY last_updated DESC LIMIT ?, ?"
			query = mysql.format(query, [
				offset,
				26
			])
			db.query(query,
				(err, result) => {
					if (err)
						reject(err)
					else
						resolve(result)
				})
		})
	}

	static getStartingOffset() {
		return new Promise((resolve, reject) => {
			db.query("SELECT COUNT(*) as 'count' FROM topic WHERE status > 1",
			(err, res) => {
				if (err)
					reject (err)
				else
					resolve(res[0].count)
			})
		})
	}

	/**-----------------------------------\ METHOD /----------------------------------\
	 * @name getMsgCount
	 * @desc : renvoi le nbr de msg dans le topic
	 * -------------------------------------------------------------------------------\
	 * @param {int} id
	 * -------------------------------------------------------------------------------\
	 * @return promise - int count
	\--------------------------------------------------------------------------------*/

	static getMsgCount(id) {
		return new Promise((resolve, reject) => {
			db.query("SELECT COUNT(*) as 'count' FROM msg WHERE ?", {topic_id: id},
			(err, result) => {
				if (err)
					reject (err) 
				else
					resolve(result[0])
			})
		})
	}
}