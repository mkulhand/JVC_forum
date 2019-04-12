var express = require('express')

express.response.resp = function(httpResponse, response = "", data = "") {
	this.status(httpResponse).setHeader("ResponseMessage", response)
	this.send(data)
}

module.exports = express