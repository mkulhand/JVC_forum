var mysql = require('mysql')

var db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: (process.env.PRODUCTION === "1") ? "legende" : "root",
	database: "forum"
})
db.connect(function(err) {
	if (err) throw err
})

module.exports = db