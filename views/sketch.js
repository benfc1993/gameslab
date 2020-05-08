var state;
var localPlayer;
var slots;
var gutter;
var center;
var space;
var cardWidth;
var cardHeight;
var playSpaces;

function setup() {
	socket = io.connect("http://localhost:3000");

	socket.on("404-error", () => {
		window.location.href = "/";
	});

	state = {};

	let userData = JSON.parse(localStorage.getItem("game_data"));
	socket.emit("joinGame", userData);

	socket.on("gameJoined", (data) => {
		let dataUsers = JSON.parse(data.users);
		let dataCards = JSON.parse(data.deck);
		let dataState = JSON.parse(data.state);
		console.log(dataState);
		console.log(dataUsers);
		localPlayer = {
			host: dataUsers.indexOf(userData.userName) == 0,
			seat: dataUsers.indexOf(userData.userName),
			selected:
				dataState != null
					? dataState.players[dataUsers.indexOf(userData.userName)].selected
					: false,
			startCard: null,
			playSpace: null,
		};

		console.log(localPlayer.selected);

		createCanvas(800, 800);
		state = {
			roomCode: userData.roomCode,
			players: [],
			cards: dataCards,
			deck: [],
			game: {
				swap: false,
				swapStart: null,
				swapEnd: null,
				night: true,
				started: 1,
			},
		};
		var cardMarginX = 5;
		var cardMarginY = 0;
		gutter = 30;
		center = width - gutter * 2;
		space = center / state.cards.length;
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
						gutter + space * index + cardMarginX,
						height / 2 - cardHeight / 2 + cardMarginY,
						gutter + space * index + cardMarginX,
						height / 2 - cardHeight / 2 + cardMarginY,
						card,
						new CardMenu()
					)
				);
			}
		});
		dataUsers.forEach((user, index) => {
			console.log(user);
			state.players.push({
				id: index,
				name: user,
				card: null,
				selected: dataState != null ? dataState.players[index].selected : "",
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
			console.log("host send state");
			sendState();
		}
		if (localPlayer.seat != null && dataState != null) {
			sendState();
		}
		// socket.on("updateState", (data) => (state = data));
		socket.on("newState", (data) => {
			state.players = data.players;
			state.deck.forEach((card, index) => {
				card.pos.x = data.deck[index].posX;
				card.pos.y = data.deck[index].posY;
				card.destination.x = data.deck[index].desX;
				card.destination.y = data.deck[index].desY;
			});

			state.game = data.game;
		});
		if (localPlayer.host) {
			this.continue = createButton("Start Day");
			this.continue.size(150, 60);
			this.continue.position(width - 200, 30);
			this.continue.mouseClicked(() => {
				state.game.night = false;
				state.deck.forEach((card) => {
					card.menu.removeButtons();
					this.vote = createButton("VOTE!");
					this.vote.size(150, 60);
					this.vote.position(width - 200, 30);
					this.vote.mouseClicked(() => {
						state.game.night = true;
					});
				});
			});
		}
	});
}

function draw() {
	if (localPlayer && state) {
		background(50);
		if (localPlayer.host) {
			if (state.game.night) {
				this.continue;
			} else {
				this.continue.remove();
				this.vote;
			}
		}
		state.deck.forEach((card) => {
			card.update();
			card.show();
			if (card.menu.display && state.game.night) {
				card.menu.show();
			}
		});
		playSpaces.forEach((space) => {
			space.show();
		});
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
	push();
	sendState();
	pop();
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
	console.log("selected", localPlayer.selected);
	console.log("state selected", state.players[localPlayer.seat].selected);
	minState = {
		roomCode: state.roomCode,
		players: state.players,
		deck: minDeck,
		game: state.game,
	};
	socket.emit("updateState", minState);
}
