var mysql = require("mysql");
var connection = mysql.createConnection({
	host: "localhost",
	user: "root",
	database: "werewolf",
});

module.exports = connection;
