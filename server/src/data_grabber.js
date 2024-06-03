const http = require("http");

function grabData(ip) {
	return new Promise((resolve, reject) => {
		try {
		http.get(`http://${ip}:3000/getdata`, (res) => {
			console.log(ip)
			let data = '';
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				resolve(data);
			});
			res.on('error', (err) => {
				reject(err);
			});
		});
	} catch (err) {
		reject(err);
	}
  });
};
module.exports = grabData;