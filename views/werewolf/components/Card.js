class Card {
	constructor(x, y, desX, desY, text, menu) {
		(this.x = x),
			(this.y = y),
			(this.pos = createVector(x, y)),
			(this.destination = createVector(desX, desY)),
			(this.text = text),
			(this.width = cardWidth),
			(this.height = space),
			(this.menu = menu),
			(this.selected = false),
			(this.view = false),
			(this.vel = createVector()),
			(this.acc = createVector()),
			(this.maxSpeed = 20),
			(this.maxForce = 2),
			(this.counter = 0);
	}
	move() {
		var desired = p5.Vector.sub(this.destination, this.pos);
		var d = desired.mag();
		var speed = this.maxSpeed;
		if (d < 100) {
			speed = map(d, 0, 100, 0, this.maxSpeed);
		}
		desired.setMag(speed);
		var steer = p5.Vector.sub(desired, this.vel);
		steer.limit(this.maxForce);
		this.acc.add(steer);
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}
	update() {
		this.move();
	}
	show() {
		fill(245, 135, 58);
		stroke(123, 54, 72);
		rect(this.pos.x, this.pos.y, this.width, this.height);
		if ((this.view && this.counter < 100) || state.game.end) {
			push();
			textAlign(CENTER);
			noStroke();
			fill(50);
			text(
				this.text,
				this.pos.x,
				this.pos.y + this.height / 2 - 20,
				this.width,
				this.pos.y + this.height / 2
			);
			pop();
			this.counter++;
		} else {
			this.counter = 0;
			this.view = false;
		}
	}
	clicked() {
		if (
			mouseX > this.pos.x &&
			mouseX < this.pos.x + this.width &&
			mouseY > this.pos.y &&
			mouseY < this.pos.y + this.height &&
			!this.menu.display
		) {
			//Display card options
			this.menu.display = true;
			this.menu.update(this);
			this.menu.show();
		}
	}
	swap() {
		if (
			mouseX > this.pos.x &&
			mouseX < this.pos.x + this.width &&
			mouseY > this.pos.y &&
			mouseY < this.pos.y + this.height &&
			this != state.game.swapStart
		) {
			state.game.swapEnd = this;
			swapCards();
		}
	}
}
