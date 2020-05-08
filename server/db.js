// var mysql = require("mysql");
// var connection = mysql.createConnection({
// 	host: "localhost",
// 	user: "root",
// 	database: "werewolf",
// });

const { Client } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = `postgres://ilrqwdawpcoiea:84bb797c380c3f668f22f3fb82d510adf512af12194ee5799efec621de5cba77@ec2-176-34-97-213.eu-west-1.compute.amazonaws.com:5432/d3a2ctvufc8v9j`;

const connection = new Client({
	connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
	ssl: true,
});

module.exports = connection;
