'use strict';

/*
 * Logitech R400 key/keypress-event mapping:
 * 				key	which	code	char
 * left:		33	0		0		!		PageUp		point left
 * right:		34	0		0		"		PageDown	point right
 * black:		0	46		46		.		.			start/stop time
 * start/stop:	116	0		0		t		Escape/F5	refresh
 */

var matchEnded = false;

function endMatch() {
	if (time.running) {
		time.toggleTime();
	}

	matchEnded = true;
}

var config = {
	// maximum time in seconds
	maxTime: 300,

	// maximum points
	maxScore: 5,

	// keys
	pointLeft: "PageUp",
	pointRight: "PageDown",
	toggleTime: ".",
	reset: "Escape"
};

var time = {
	currentTime: 0,
	lastTimestamp: 0,
	running: false,

	reset: function() {
		this.currentTime = 0;
		this.lastTimestamp = 0;
		this.running = false;
		this.updateScoreboard();
	},

	toggleTime: function () {
		if (!matchEnded) {
			if (this.running) {
				// stop time
				this.running = false;
			} else {
				// start time
				this.running = true;
				this.lastTimestamp = Date.now() - this.currentTime;
				this.updateTime();
			}
		}
	},

	updateScoreboard: function() {
		var seconds = Math.round(time.currentTime / 1000);
		var minutes = Math.floor(seconds / 60);
		seconds = (seconds % 60 < 10) ? "0" + seconds % 60 : seconds % 60;
		document.getElementById("minutesId").textContent = minutes;
		document.getElementById("secondsId").textContent = seconds;
	},

	updateTime: function(){
		if (time.running) {
			time.currentTime = Date.now() - time.lastTimestamp;
			time.updateScoreboard();
			if (time.currentTime > config.maxTime * 1000) {
				endMatch();
			}
			window.setTimeout(time.updateTime, 250);
		}
	}
};

var score = {
	scoreLeft: 0,
	scoreRight: 0,

	addPoint: function(left, right) {
		if (!matchEnded) {
			this.scoreLeft += left;
			this.scoreRight += right;
			this.updateScoreboard();
			if (this.scoreRight >= config.maxScore || this.scoreLeft >= config.maxScore) {
				endMatch();
			}
		}
	},

	reset: function() {
		this.scoreLeft = 0;
		this.scoreRight = 0;
		this.updateScoreboard();
	},

	updateScoreboard: function() {
		document.getElementById("scoreLeftId").textContent = this.scoreLeft;
		document.getElementById("scoreRightId").textContent = this.scoreRight;
	}
};

function keyHandle(event) {
	switch(event.key) {
		case config.pointLeft:
			score.addPoint(1, 0);
			break;
		case config.pointRight:
			score.addPoint(0, 1);
			break;
		case config.toggleTime:
			time.toggleTime();
			break;
		case config.reset:
			// location.reload(true) doesn't reset js-objects??
			score.reset();
			time.reset();
			matchEnded = false;
			break;
	}
}

window.onload = function(){
	document.onkeypress = keyHandle;
}
