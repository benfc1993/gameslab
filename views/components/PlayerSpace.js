class PlayerSpace {
	constructor(player, index) {
		(this.id = player.id),
			(this.name = player.name),
			(this.card = player.card),
			(this.index = index),
			(this.pos = createVector());
		if (this.index < 3) {
			this.pos.x = (width / 4) * (this.index + 1);
			this.pos.y = 30;
		} else {
			this.pos.x = (width / 4) * (this.index - 2);
			this.pos.y = height - (space + 70);
		}
	}

	show() {
		noFill();
		stroke(255);
		rect(this.pos.x, this.pos.y, space + 40, space + 40);
		fill(255);
		textSize(16);
		text(
			this.name,
			this.pos.x,
			this.pos.y - 20,
			this.pos.x + space + 40,
			this.pos.y
		);
	}
}
