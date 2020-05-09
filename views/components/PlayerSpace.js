class PlayerSpace {
	constructor(player, index) {
		(this.id = player.id),
			(this.name = player.name),
			(this.card = player.card),
			(this.index = index),
			(this.makeVotes = true),
			(this.voteArr = []),
			(this.pos = createVector());
		if (this.index < 3) {
			this.pos.x = (width / 4) * (this.index + 1);
			this.pos.y = 30;
		} else {
			this.pos.x = (width / 4) * (this.index - 2);
			this.pos.y = height - (space + 70);
		}
		this.textCounter = 0;
	}

	show() {
		noFill();
		stroke(255);
		rect(this.pos.x, this.pos.y, space, space + 20);
		fill(255);
		textSize(16);
		text(
			this.name,
			this.pos.x,
			this.pos.y - 20,
			this.pos.x + space + 40,
			this.pos.y
		);
		if (localPlayer.voted && this.textCounter < 90) {
			push();
			fill(255, 12, 10);
			noStroke();
			textSize(24);
			text('Voted', width / 2, 50);
			pop();
			this.textCounter++;
		}
		if (state.game.reveal) {
			if (this.makeVotes) {
				this.makeVotes = false;
				let votes = state.players[this.id].votes;
				for (let i = 0; i < votes; i++) {
					this.voteArr.push({
						x: random(this.pos.x + 20, this.pos.x + space - 20),
						y: random(this.pos.y + 20, this.pos.y + space),
					});
				}
			}
			push();
			this.voteArr.forEach((vote) => {
				fill(255, 12, 10);
				ellipse(vote.x, vote.y, 20);
			});
			pop();
		}
	}
	clicked() {
		console.log(state.game.vote);
		if (
			mouseX > this.pos.x &&
			mouseX < this.pos.x + space &&
			mouseY > this.pos.y &&
			mouseY < this.pos.y + space + 20 &&
			state.game.vote &&
			!state.game.reveal &&
			!localPlayer.voted
		) {
			this.castVote();
		}
	}
	castVote() {
		state.players[this.id].votes++;
		localPlayer.voted = true;
		state.players[localPlayer.seat].voted = true;
		sendState();
	}
}
