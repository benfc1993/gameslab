'user strict';
var sql = require('../db.js');

//Game object constructor
var Game = function (game) {
	this.game = game.name;
};
Game.createGame = function (data, result) {
	sql.query(
		'INSERT INTO games(room_code, users, lobby) values($1, $2, 1)',
		[data.roomCode, JSON.stringify([data.userName])],
		function (err, res) {
			if (err) {
				console.log('create error: ', err);
				result(err);
			} else {
				result(res.rows[0]);
			}
		}
	);
};

Game.getGameById = function (id, result) {
	sql.query('Select * from games where id = $1', [id], function (err, res) {
		if (err) {
			console.log('error: ', err);
			result(err, null);
		} else {
			result(res.rows[0]);
		}
	});
};

Game.getGameByCode = function (data, result) {
	sql.query('SELECT * FROM games WHERE room_code = $1', [data], function (
		err,
		res
	) {
		if (err) {
			console.log('get by code error: ', err);
			result(false);
		} else {
			result(res.rows[0]);
		}
	});
};

Game.getAllGames = function (result) {
	sql.query('Select * from games', function (err, res) {
		if (err) {
			console.log('error: ', err);
			result(err);
		} else {
			result(res.rows);
		}
	});
};
Game.updateByCode = function (data, result) {
	sql.query(
		'UPDATE games SET users = $1 WHERE room_code = $2',
		[JSON.stringify(data.userName), data.roomCode],
		function (err, res) {
			if (err) {
				console.log('update error: ', err);
				result(err);
			} else {
				result(res.rows[0]);
			}
		}
	);
};

Game.updateGameState = function (data, result) {
	sql.query(
		'UPDATE games SET state = $1 WHERE room_code = $2',
		[JSON.stringify(data), data.roomCode],
		function (err, res) {
			if (err) {
				console.log('error: ', err);
				result(err);
			} else {
				result(res.rows[0]);
			}
		}
	);
};
Game.updateDeckByCode = function (data, result) {
	sql.query(
		'UPDATE games SET deck = $1, lobby = 0 WHERE room_code = $2',
		[JSON.stringify(data.deck), data.roomCode],
		function (err, res) {
			if (err) {
				console.log('error: ', err);
				result(err);
			} else {
				result(res.rows[0]);
			}
		}
	);
};
Game.remove = function (id, result) {
	sql.query('DELETE FROM games WHERE room_code = $1', [id], function (
		err,
		res
	) {
		if (err) {
			console.log('error: ', err);
			result(err);
		} else {
			result(res.rows[0]);
		}
	});
};

module.exports = Game;
