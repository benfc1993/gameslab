'user strict';
var sql = require('../db.js');

//Game object constructor
var Game = function (game) {
	this.game = game.name;
};
Game.createGame = function (data, result) {
	sql.query(
		'INSERT INTO public.games set room_code = ?, users = ?, lobby = 1',
		[data.roomCode, JSON.stringify([data.userName])],
		function (err, res) {
			if (err) {
				console.log('error: ', err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};

Game.getGameById = function (id, result) {
	sql.query('Select * from public.games where id = ?', id, function (err, res) {
		if (err) {
			console.log('error: ', err);
			result(err, null);
		} else {
			result(res[0]);
		}
	});
};

Game.getGameByCode = function (data, result) {
	sql.query('Select * from public.games where room_code = ?', data, function (
		err,
		res
	) {
		if (err) {
			console.log('error: ', err);
			result(false);
		} else {
			result(res[0]);
		}
	});
};

Game.getAllGames = function (result) {
	sql.query('Select * from public.games', function (err, res) {
		if (err) {
			console.log('error: ', err);
			result(err);
		} else {
			result(res);
		}
	});
};
Game.updateByCode = function (data, result) {
	sql.query(
		'UPDATE public.games SET users = ? WHERE room_code = ?',
		[JSON.stringify(data.userName), data.roomCode],
		function (err, res) {
			if (err) {
				console.log('error: ', err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};

Game.updateGameState = function (data, result) {
	sql.query(
		'UPDATE public.games SET state = ? WHERE room_code = ?',
		[JSON.stringify(data), data.roomCode],
		function (err, res) {
			if (err) {
				console.log('error: ', err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};
Game.updateDeckByCode = function (data, result) {
	sql.query(
		'UPDATE public.games SET deck = ?, lobby = 0 WHERE room_code = ?',
		[JSON.stringify(data.deck), data.roomCode],
		function (err, res) {
			if (err) {
				console.log('error: ', err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};
Game.remove = function (id, result) {
	sql.query('DELETE FROM public.games WHERE id = ?', [id], function (err, res) {
		if (err) {
			console.log('error: ', err);
			result(err);
		} else {
			result(res);
		}
	});
};

module.exports = Game;
