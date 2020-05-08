"user strict";
var sql = require("../db.js");

//Game object constructor
var Game = function (game) {
	this.game = game.name;
};
Game.createGame = function (data, result) {
	sql.query(
		"INSERT INTO games set room_code = ?, users = ?, lobby = 1",
		[data.roomCode, JSON.stringify([data.userName])],
		function (err, res) {
			if (err) {
				console.log("error: ", err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};

Game.getGameById = function (id, result) {
	sql.query("Select * from games where id = ?", id, function (err, res) {
		if (err) {
			console.log("error: ", err);
			result(err, null);
		} else {
			result(res[0]);
		}
	});
};

Game.getGameByCode = function (data, result) {
	sql.query("Select * FROM games where room_code = ?", data, function (
		err,
		res
	) {
		if (err) {
			console.log("error: ", err);
			console.log(data);
			result(false);
		} else {
			result(res[0]);
		}
	});
};

Game.getAllGames = function (result) {
	sql.query("Select * from games", function (err, res) {
		if (err) {
			console.log("error: ", err);
			result(err);
		} else {
			result(res);
		}
	});
};
Game.updateByCode = function (data, result) {
	sql.query(
		"UPDATE games SET users = ? WHERE room_code = ?",
		[JSON.stringify(data.userName), data.roomCode],
		function (err, res) {
			if (err) {
				console.log("error: ", err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};

Game.updateGameState = function (data, result) {
	sql.query(
		"UPDATE games SET state = ? WHERE room_code = ?",
		[JSON.stringify(data), data.roomCode],
		function (err, res) {
			if (err) {
				console.log("error: ", err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};
Game.updateDeckByCode = function (data, result) {
	sql.query(
		"UPDATE games SET deck = ?, lobby = 0 WHERE room_code = ?",
		[JSON.stringify(data.deck), data.roomCode],
		function (err, res) {
			if (err) {
				console.log("error: ", err);
				result(err);
			} else {
				result(res);
			}
		}
	);
};
Game.remove = function (id, result) {
	sql.query("DELETE FROM games WHERE room_code = ?", id, function (err, res) {
		if (err) {
			console.log("error: ", err);
			result(err);
		} else {
			result(res);
		}
	});
};

module.exports = Game;
