var db = require('../sql')
var mysql = require('mysql')
const util = require('../utility')
const passwordHash = require('password-hash')
var jwt = require('jsonwebtoken')
var jti = 0


/**-----------------------------------\ CLASS /-----------------------------------\
 * @name user
 * @desc : gère les requêtes relatives aux utilisateur
 * rank:
 * -1: banned user
 * 0:  normal user
 * 1:  moderator
 * 2:  admin
 * @summary :
 * -------------------------------------------------------------------------------\
 * @param {String}	username
 * @param {String}	password
 * @param {int}		rank
\--------------------------------------------------------------------------------*/

module.exports = class user {

	constructor(detail = null) {
		if (detail) {
			this.username =		detail.username
			this.password =		detail.password
			this.rank =			detail.rank
			this.lastActif =	detail.lastActif
			if (detail.ip)
				this.ip = detail.ip
		}
		return this
	}

	setPassword(password) { this.password = password }
	setLastActif() { this.lastActif = util.getTimestampDate() }
	setRank(rank) { this.rank = rank }

	import(id) {
		return new Promise((resolve, reject) => {
			db.query('SELECT * FROM user WHERE ?', {id: id},
			(err, result) => {
				if (err || !result.length) {
					reject(err)
				} else if (result.length) {
					this.id =			id
					this.username =		result[0].username
					this.rank =			parseInt(result[0].rank)
					resolve(this)
				}
			})
		})
	}

	insert() {
		return new Promise((resolve, reject) => {
			db.query('INSERT INTO user SET ?',
			{
				username:	this.username,
				password:	this.password,
				rank:		this.rank,
				lastActif:	util.getTimestampDate()
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
			let query = 'UPDATE user SET ? WHERE ?'
			query = mysql.format(query, [
				{
					username:	this.username,
					rank:		this.rank,
					lastActif:	this.lastActif,
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
		return new Promise((resolve, reject) => {
			db.query('DELETE FROM user WHERE ?', {id: id},
			async (err, result) => {
				if (err)
					reject(err)
				else if (result.affectedRows) {
					await this.deleteMsg(id)
					resolve(result)
				} else
					reject(err)
			})
		})
	}

	deleteMsg(id) {
		db.query('DELETE FROM msg WHERE author_id = ?', [id],
		(err, result) => {
			if (err)
				return(0)
			else
				return(1)
		})
	}

	/**-----------------------------------\ METHOD /----------------------------------\
	 * @name authenticate
	 * @desc : authentifie un utilisateur et renvoi un jwt token
	 * le token contient l'ip si l'user est super user
	 * -------------------------------------------------------------------------------\
	 * @param {String} username
	 * @param {String} password
	 * -------------------------------------------------------------------------------\
	 * @return {Object} jwt token
	\--------------------------------------------------------------------------------*/

	authenticate(username = "") {
		return new Promise((resolve, reject) => {
			db.query('SELECT id, password, rank FROM user WHERE username LIKE ?', [this.username],
			async (err, result) => {
				if (err) reject(err)
				if (result.length) {
					let hashedPassword = result[0].password
					if (passwordHash.verify(this.password, hashedPassword)) {
						await this.import(result[0].id)
						this.setLastActif()
						this.update()
						if (result[0].rank > 0) { // super user
							var token = jwt.sign(
								{
									jti:		jti++,
									id:			result[0].id,
									username:	username ? username : this.username,
									ip:			this.ip
								},
								process.env.SECRET,
								{ expiresIn: util.getExpirationToken("1d") }
							)
						} else { // normal user
							var token = jwt.sign(
								{
									jti:		jti++,
									id:			result[0].id,
									username:	username ? username : this.username,
								},
								process.env.SECRET,
								{ expiresIn: util.getExpirationToken("1d") }
							)
						}
						resolve(token)
					} else
						reject(errmsg.INCORRECT_PASSWORD)
				} else
					reject(errmsg.INCORRECT_USERNAME)
			})
		})
	}
}