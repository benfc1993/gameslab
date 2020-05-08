console.log('server is starting');

require('dotenv').config();
var express = require('express');
var app = express();
var server = app.listen(process.env.PORT, listening);
var socket = require('socket.io');
var io = socket(server);
var sql = require('./db.js');

sql.connect();

app.set('view engine', 'ejs');

app.use(express.static('./views'));
app.get('/', (req, res) => {
	res.render('index');
});

app.get('/lobby', (req, res) => {
	res.render('lobby');
});

app.get('/game', (req, res) => {
	res.render('game');
});

var Games = require('./models/games.js');

var connectCounter = 0;
function listening() {
	console.log('listening port:' + process.env.PORT);
}

app.use(express.static('./client'));

io.sockets.on('connection', newConnection);
process.on('unhandledRejection', (error) => {
	// Will print "unhandledRejection err is not defined"
	console.log('unhandledRejection', error.message);
});
function newConnection(socket) {
	console.log('socket connected !!!!!!');
	socket.on('createRoom', (data) => {
		console.log('creating room...........');
		let msg = [];
		if (data.roomCode.length == 4 && data.userName.length > 0) {
			Games.getGameByCode(data.roomCode, (found) => {
				console.log('get game by code: ', found);
				if (!found) {
					Games.createGame(data, (res) => {
						socket.emit('roomCreated', res);
					});
				} else {
					msg.push('room already exists');
					socket.emit('error-message', msg);
				}
			});
		} else {
			if (data.userName.length <= 0) {
				msg.push('please enter a Username');
			}
			if (data.roomCode.length != 4) {
				msg.push('Room code must be 4 characters long');
			}
			socket.emit('error-message', msg);
		}
	});
	socket.on('findRoom', (data) => {
		Games.getGameByCode(data.roomCode, (res) => {
			if (res && res.lobby == 1) {
				socket.userName = data.userName;
				socket.roomCode = data.roomCode;
				socket.emit('roomFound', res);
			} else if (res.lobby != 1) {
				socket.emit('error-message', ['Game started']);
			} else {
				socket.emit('error-message', ['Room not found']);
			}
		});
	});
	socket.on('joinLobby', (data) => {
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
				io.emit('updateLobby', users);
			} else {
				socket.emit('404-error');
			}
		});
	});
	socket.on('deckChange', (deck) => {
		socket.broadcast.emit('newDeck', deck);
	});
	socket.on('startGame', (data) => {
		Games.updateDeckByCode(data, (res) => {
			io.emit('loadGame');
		});
	});
	socket.on('joinGame', (data) => {
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
				socket.emit('gameJoined', res);
			} else {
				socket.emit('404-error');
			}
		});
	});

	socket.on('updateState', (data) => {
		Games.updateGameState(data, (res) => {
			io.emit('newState', data);
		});
	});
	socket.on('endGame', (roomCode) => {
		Games.remove(roomCode, (res) => {
			io.emit('exitGame');
		});
	});
	socket.on('disconnect', () => {
		let data = {
			userName: socket.userName,
			roomCode: socket.roomCode ? socket.roomCode : '',
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
				io.emit('updateLobby', users);
			}
		});
	});
}
