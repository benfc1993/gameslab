class CardMenu {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.width = 50;
		this.display = false;
		this.close;
		this.select;
		this.view;
		this.swap;
	}
	update(card) {
		this.card = card;
		this.x = card.pos.x;
		this.y = card.pos.y;
		if (this.display) {
			state.deck.forEach((card) => {
				if (card != this.card) {
					card.menu.display = false;
					card.menu.removeButtons();
				}
			});
			this.showButtons();
		}
	}

	showButtons() {
		this.close = createButton('close');
		this.close.size(60, 30);
		this.close.position(
			this.x + (windowWidth / 2 - width / 2) + this.width / 2,
			this.y + this.card.height + 10
		);
		if (!this.card.selected && !localPlayer.selected) {
			if (state.game.turn == localPlayer.seat) {
				this.select = createButton('select');
				this.select.size(60, 30);
				this.select.position(
					this.x + (windowWidth / 2 - width / 2) + this.width / 2,
					this.y + this.card.height + 50
				);
			}
		} else {
			if (state.game.night || state.game.end) {
				this.view = createButton('view');
				this.view.size(60, 30);
				this.view.position(
					this.x + (windowWidth / 2 - width / 2) + this.width / 2,
					this.y + this.card.height + 50
				);
			}
			this.swap = createButton('swap');
			this.swap.size(60, 30);
			this.swap.position(
				this.x + (windowWidth / 2 - width / 2) + this.width / 2,
				this.y + this.card.height + 90
			);
		}
	}

	removeButtons() {
		if (this.close) {
			this.close.remove();
		}
		if (this.select) {
			this.select.remove();
		}
		if (this.view) {
			this.view.remove();
		}
		if (this.swap) {
			this.swap.remove();
		}
	}
	show() {
		if (this.display) {
			fill(0, 255, 123);
			if (this.close) {
				this.close.mousePressed(() => {
					this.display = false;
					this.removeButtons();
					this.show();
				});
			}
			if (this.select) {
				this.select.mousePressed(() => {
					localPlayer.selected = true;
					localPlayer.startCard = this.card;
					state.game.turn++;
					state.players.forEach((player) => {
						if (player.id == localPlayer.seat) {
							localPlayer.card = this.card;
						}
					});
					this.card.selected = true;
					this.card.destination.x =
						localPlayer.playSpace.pos.x + (space - cardWidth) / 2;
					this.card.destination.y = localPlayer.playSpace.pos.y + 10;
					this.display = false;
					this.removeButtons();
					this.show();
					sendState();
				});
			}

			if (this.view) {
				this.view.mousePressed(() => {
					this.card.view = true;
				});
			}
			if (this.swap) {
				this.swap.mousePressed(() => {
					state.game.swap = true;
					state.game.swapStart = this.card;
				});
			}
		}
	}
}
