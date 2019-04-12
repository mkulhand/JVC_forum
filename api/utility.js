const time = {
	Y: 31536000,
	M: 2592000,
	d: 86400,
	h: 3600,
	m: 60,
	s: 1
}

module.exports = {
	getTimestamp: function() {
		var currentdate = new Date()
		var datetime = currentdate.getFullYear() + "-"
						+ (currentdate.getMonth()+1) + "-"
						+ currentdate.getDate() + " "
						+ currentdate.getHours() + ":"
						+ currentdate.getMinutes() + ":"
						+ currentdate.getSeconds()
		return (datetime)
	},
	getExpirationToken: function(date) {
		let expTime = 0
		let match = date.match(/(\d+Y)?(\d+M)?(\d+d)?(\d+h)?(\d+m)?(\d+s)?/)
		for (let i = 1; i < match.length; i++) {
			if (match[i] !== undefined)
			expTime += time[match[i].slice(-1)] * parseInt(match[i], 10)
		}
		return Math.round(expTime)
	},
	getTimestampDate: function() {
		var currentdate = new Date()
		var datetime = currentdate.getFullYear() + "-"
						+ (currentdate.getMonth()+1) + "-"
						+ currentdate.getDate() + " "
		return (datetime)
	}
}