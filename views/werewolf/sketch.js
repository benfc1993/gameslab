var state;
var localPlayer;
var slots;
var gutter;
var center;
var space;
var cardWidth;
var cardHeight;
var playSpaces;
var socket = io(window.location.origin);
var userData;
var font;
function preload() {
	font = loadFont('./font/PermanentMarker-Regular.ttf');
}
function setup() {
	textFont(font);
	socket.on('404-error', () => {
		window.location.href = '/';
	});
	state = {};
	this.stage = 'Night';
	userData = JSON.parse(localStorage.getItem('game_data'));
	socket.emit('joinGame', userData);

	socket.on('exitGame', () => {
		window.location.href = '/';
	});

	socket.on('gameJoined', (data) => {
		let dataUsers = JSON.parse(data.users);
		let dataCards = JSON.parse(data.deck);
		let dataState = JSON.parse(data.state);
		localPlayer = {
			host: dataUsers.indexOf(userData.userName) == 0,
			seat: dataUsers.indexOf(userData.userName),
			selected:
				dataState != null
					? dataState.players[dataUsers.indexOf(userData.userName)].selected
					: false,
			startCard: null,
			playSpace: null,
			voted:
				dataState != null
					? dataState.players[dataUsers.indexOf(userData.userName)].voted
					: false,
		};

		createCanvas(1200, 800);
		state = {
			roomCode: userData.roomCode,
			players: [],
			cards: dataCards,
			deck: [],
			game: {
				swap: false,
				swapStart: null,
				swapEnd: null,
				night: dataState != null ? dataState.game.night : true,
				vote: dataState != null ? dataState.game.vote : false,
				reveal: dataState != null ? dataState.game.reveal : false,
				end: dataState != null ? dataState.game.end : false,
				started: 1,
				turn: dataState != null ? dataState.game.turn : 0,
			},
		};
		var cardMarginX = 20;
		var cardMarginY = 0;
		gutter = 30;
		center = width - gutter * 2;
		space = 125;
		cardWidth = space - cardMarginX;
		cardHeight = space + cardMarginY;
		playSpaces = [];
		state.cards.forEach((card, index) => {
			if (dataState != null) {
				state.deck.push(
					new Card(
						dataState.deck[index].posX,
						dataState.deck[index].posY,
						dataState.deck[index].desX,
						dataState.deck[index].desY,
						card,
						new CardMenu()
					)
				);
			} else {
				state.deck.push(
					new Card(
						gutter + space * index,
						height / 2 - cardHeight / 2 + cardMarginY,
						gutter + space * index,
						height / 2 - cardHeight / 2 + cardMarginY,
						card,
						new CardMenu()
					)
				);
			}
		});
		dataUsers.forEach((user, index) => {
			state.players.push({
				id: index,
				name: user,
				card: null,
				selected: dataState != null ? dataState.players[index].selected : '',
				voted: dataState != null ? dataState.players[index].voted : '',
				votes: 0,
			});
		});
		state.players.forEach((player, index) => {
			playSpaces.push(new PlayerSpace(player, index));
		});
		playSpaces.forEach((space) => {
			if (space.id == localPlayer.seat) {
				localPlayer.playSpace = space;
			}
		});
		if (dataState != null) {
			localPlayer.selected =
				dataState.players[dataUsers.indexOf(userData.userName)].selected;
		}
		if (localPlayer.host && dataState == null) {
			sendState();
		}
		if (localPlayer.seat != null && dataState != null) {
			sendState();
		}
		// socket.on("updateState", (data) => (state = data));
		socket.on('newState', (data) => {
			state.players = data.players;
			state.game = data.game;
			state.deck.forEach((card, index) => {
				card.pos.x = data.deck[index].posX;
				card.pos.y = data.deck[index].posY;
				card.destination.x = data.deck[index].desX;
				card.destination.y = data.deck[index].desY;
			});
		});
		if (localPlayer.host) {
			this.button = createButton('Next');
			this.button.size(150, 60);
			this.button.position(windowWidth / 2 + width / 2 - 200, 30);
			this.button.mouseClicked(() => {
				if (state.game.night && state.game.turn >= state.players.length) {
					state.game.night = false;
					sendState();
					state.deck.forEach((card) => {
						card.menu.removeButtons();
					});
				} else if (
					!state.game.night &&
					!state.game.vote &&
					!state.game.reveal
				) {
					state.game.vote = true;
					sendState();
				} else if (state.game.vote && !state.game.reveal) {
					state.game.reveal = true;
					sendState();
				} else if (state.game.reveal) {
					state.game.end = true;
					this.stage = 'Game over';
					sendState();
					this.button = createButton('End Game');
					this.button.size(150, 60);
					this.button.position(windowWidth / 2 + width / 2 - 200, 30);
					this.button.mouseClicked(() => {
						socket.emit('endGame', userData.roomCode);
						sendState();
					});
				}
			});
		}
	});
}

function draw() {
	if (state.game != null) {
		if (state.game.night) {
			this.stage = 'Night';
		} else if (!state.game.night && !state.game.vote && !state.game.reveal) {
			this.stage = 'Day';
		} else if (state.game.vote && !state.game.reveal) {
			this.stage = 'Voting';
		} else if (state.game.reveal && !state.game.end) {
			this.stage = 'Results';
		} else if (state.game.end) {
			this.stage = 'Game over';
		}
	}
	if (localPlayer && state) {
		background(50);
		state.deck.forEach((card) => {
			card.update();
			card.show();
			if (card.menu.display && (state.game.night || state.game.vote)) {
				card.menu.show();
			}
		});
		playSpaces.forEach((space) => {
			space.show();
		});
		fill(255);
		textSize(30);
		text(this.stage, width - 200, 120);
		if (state.game.turn == localPlayer.seat && state.game.night) {
			push();
			fill(245, 135, 58);
			noStroke();
			textSize(34);
			textAlign(CENTER);
			text('Select a card', width / 2, height / 2 - cardHeight - 30);
			pop();
		}
	}
}

function mouseClicked() {
	state.deck.forEach((card) => {
		if (!card.menu.display && !state.game.swap && state.game.night) {
			card.clicked();
		} else if (state.game.swap) {
			card.swap();
		}
	});
	playSpaces.forEach((space) => {
		space.clicked();
	});
}

function swapCards() {
	//close menu
	state.game.swapStart.menu.removeButtons();
	state.game.swapStart.menu.display = false;

	//get new positions
	let newStart = state.game.swapEnd.pos.copy();
	let newEnd = state.game.swapStart.pos.copy();

	//set destinations
	state.game.swapStart.destination = newStart;
	state.game.swapEnd.destination = newEnd;

	//reset state
	state.game.swap = false;
	state.game.swapStart = null;
	state.game.swapEnd = null;
	sendState();
}

function sendState() {
	var minDeck = [];
	state.deck.forEach((card) => {
		let newCard = {
			posX: card.pos.x,
			posY: card.pos.y,
			desX: card.destination.x,
			desY: card.destination.y,
			text: card.text,
		};
		minDeck.push(newCard);
	});
	state.players[localPlayer.seat].selected = localPlayer.selected;
	minState = {
		roomCode: state.roomCode,
		players: state.players,
		deck: minDeck,
		game: state.game,
	};
	socket.emit('updateState', minState);
}
