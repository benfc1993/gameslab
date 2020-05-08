var socket = io(window.location.origin);

socket.on('404-error', () => {
	window.location.href = '/';
});

const lobbyTitle = document.getElementById('lobby-title');
const usersList = document.getElementById('users-list');
const userData = JSON.parse(localStorage.getItem('game_data'));
const cardFields = document.getElementsByClassName('card-field');
const startButton = document.getElementById('start-button');
var host;
var localUsers = [];
var deck = [];

for (let field of cardFields) {
	field.querySelector('.card-field__qty').addEventListener('change', () => {
		deck = [];
		for (let field of cardFields) {
			let qty = field.querySelector('.card-field__qty').value;
			for (let i = 0; i < qty; i++) {
				deck.push(field.getAttribute('data-type'));
			}
		}
		socket.emit('deckChange', deck);
		console.log(deck);
	});
}

socket.emit('joinLobby', userData);

lobbyTitle.innerText = `Lobby for ${userData.roomCode}`;

socket.on('updateLobby', (users) => {
	console.log('update');
	usersList.innerHTML = '';
	users.forEach((user, index) => {
		if (index == 0) {
			if (user == userData.userName) {
				host = true;
			}
		}
		if (localUsers.indexOf(user) == -1) {
			localUsers.push(user);
		}
		usersList.innerHTML += `<div class="user">${
			index == 0 ? `<p>Host</p>` : ``
		}<p>${user}</p></div>`;
	});
	if (host) {
		startButton.classList.remove('hide');
		for (let field of cardFields) {
			field.querySelector('.card-field__qty').removeAttribute('disabled');
		}
	}
});

socket.on('newDeck', (data) => {
	for (let field of cardFields) {
		field.querySelector('.card-field__qty').value = 0;
	}
	data.forEach((card, index) => {
		document.querySelector(`.card-field__qty[name="${card}"]`).value++;
	});
});

startGame = () => {
	deck = deck.sort(shuffle);
	let data = {
		roomCode: userData.roomCode,
		deck: deck,
	};
	socket.emit('startGame', data);
};
shuffle = (a, b) => 0.5 - Math.random();
socket.on('loadGame', () => {
	window.location.href = '/game';
});
