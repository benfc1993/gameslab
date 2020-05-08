console.log("server is starting");

require("dotenv").config();
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT, listening);
var socket = require("socket.io");
var io = socket(server);
// var sql = require("./db.js");

const { Client } = require('pg');

const sql = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
app.set("view engine", "ejs");
sql.connect();

app.use(express.static("./views"));
app.get("/", (req, res) => {
	console.log("woop");
	res.render("index");
});

app.get("/lobby", (req, res) => {
	res.render("lobby");
});

app.get("/game", (req, res) => {
	res.render("game");
});

var Games = require("./models/games.js");

var connectCounter = 0;
function listening() {
	console.log("listening port:" + process.env.PORT);
}

app.use(express.static("./client"));

io.sockets.on("connection", newConnection);

function newConnection(socket) {
	socket.on("createRoom", (data) => {
		let msg = [];
		if (data.roomCode.length == 4 && data.userName.length > 0) {
			Games.getGameByCode(data.roomCode, (found) => {
				if (!found) {
					console.log("create room");
					Games.createGame(data, (res) => {
						socket.emit("roomCreated", res);
					});
				} else {
					msg.push("room already exists");
					socket.emit("error-message", msg);
				}
			});
		} else {
			if (data.userName.length <= 0) {
				msg.push("please enter a Username");
			}
			if (data.roomCode.length != 4) {
				msg.push("Room code must be 4 characters long");
			}
			socket.emit("error-message", msg);
		}
	});
	socket.on("findRoom", (data) => {
		Games.getGameByCode(data.roomCode, (res) => {
			if (res) {
				socket.userName = data.userName;
				socket.roomCode = data.roomCode;
				socket.emit("roomFound", res);
			} else {
				socket.emit("error", "Room not found");
			}
		});
	});
	socket.on("joinLobby", (data) => {
		socket.userName = data.userName;
		socket.roomCode = data.roomCode;
		Games.getGameByCode(data.roomCode, (res) => {
			if (res) {
				let users = JSON.parse(res.users);
				if (users.indexOf(data.userName) == -1) {
					users.push(data.userName);
					data.userName = users;
					Games.updateByCode(data, (res) => {});
				}
				io.emit("updateLobby", users);
			} else {
				socket.emit("404-error");
			}
		});
	});

	socket.on("startGame", (data) => {
		Games.updateDeckByCode(data, (res) => {
			io.emit("loadGame");
		});
	});
	socket.on("joinGame", (data) => {
		socket.userName = data.userName;
		socket.roomCode = data.roomCode;
		Games.getGameByCode(data.roomCode, (res) => {
			if (res) {
				let users = JSON.parse(res.users);
				if (users.indexOf(data.userName) == -1) {
					users.push(data.userName);
					data.userName = users;
					Games.updateByCode(data, (res) => {});
				}
				socket.emit("gameJoined", res);
			} else {
				socket.emit("404-error");
			}
		});
	});

	socket.on("updateState", (data) => {
		Games.updateGameState(data, (res) => {
			io.emit("newState", data);
		});
	});
	socket.on("disconnect", () => {
		let data = {
			userName: socket.userName,
			roomCode: socket.roomCode,
		};
		Games.getGameByCode(data.roomCode, (res) => {
			if (res && res.lobby == 1) {
				var users = [socket.userName];
				users = JSON.parse(res.users);
				if (users.indexOf(data.userName) > -1) {
					users.splice(users.indexOf(data.userName), 1);
					data.userName = users;
					Games.updateByCode(data, (res) => {});
				}
				io.emit("updateLobby", users);
			}
		});
	});
}
