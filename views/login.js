var socket = io(window.location.origin);

const roomCode = document.getElementById('room-code');
const userName = document.getElementById('username');
const errorMessage = document.getElementById('error-message');
var old;

clearGame = (code) => {
	socket.emit('endGame', code);
};
roomCode.addEventListener('keyup', () => {
	if (roomCode.value.length > 4) {
		roomCode.value = old;
	}
	roomCode.value = roomCode.value.toUpperCase();
});
roomCode.addEventListener('keypress', () => {
	if (roomCode.value.length == 4) {
		old = roomCode.value;
	}
});
createRoom = () => {
	console.log('click create room');
	let data = {
		roomCode: roomCode.value.toUpperCase(),
		userName: userName.value,
	};
	console.log(data);
	socket.emit('createRoom', data);
};

joinRoom = () => {
	let data = {
		roomCode: roomCode.value,
		userName: userName.value,
	};
	socket.emit('findRoom', data);
};

socket.on('roomCreated', (roomId) => {
	let data = {
		roomCode: roomCode.value,
		userName: userName.value,
	};
	localStorage.setItem('game_data', JSON.stringify(data));
	window.location.href = '/werewolf/lobby';
});

socket.on('roomFound', (roomId) => {
	let data = {
		roomCode: roomCode.value,
		userName: userName.value,
	};
	localStorage.setItem('game_data', JSON.stringify(data));
	window.location.href = '/werewolf/lobby';
});

socket.on('error-message', (err) => {
	console.log(err);
	errorMessage.classList.remove('hide');
	for (let m of err) {
		errorMessage.innerHTML += `<p>${m}</p>`;
	}
	setMessageTimer();
});

setMessageTimer = () => {
	setTimeout(() => {
		errorMessage.classList.add('hide');
		errorMessage.innerText = '';
	}, 2000);
};
