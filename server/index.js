console.log("server is starting");

require("dotenv").config();
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT, listening);
var socket = require("socket.io");
var io = socket(server);
// var sql = require("./db.js");

const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";

const connectionString = `postgres://ilrqwdawpcoiea:84bb797c380c3f668f22f3fb82d510adf512af12194ee5799efec621de5cba77@ec2-176-34-97-213.eu-west-1.compute.amazonaws.com:5432/d3a2ctvufc8v9j`;

const sql = new Pool({
	connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
	ssl: true,
});
sql.connect();

console.log("env", process.env.NODE_ENV);
console.log("db url: ", process.env.DATABASE_URL);
app.set("view engine", "ejs");

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
			if (res && res.lobby == 1) {
				socket.userName = data.userName;
				socket.roomCode = data.roomCode;
				socket.emit("roomFound", res);
			} else if (res.lobby != 1) {
				socket.emit("error-message", ["Game started"]);
			} else {
				socket.emit("error-message", ["Room not found"]);
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
	socket.on("deckChange", (deck) => {
		socket.broadcast.emit("newDeck", deck);
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
	socket.on("endGame", (roomCode) => {
		Games.remove(roomCode, (res) => {
			console.log(res);
			io.emit("exitGame");
		});
	});
	socket.on("disconnect", () => {
		let data = {
			userName: socket.userName,
			roomCode: socket.roomCode ? socket.roomCode : "",
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
