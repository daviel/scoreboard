'use strict';

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
	reset: ".",
	toggleTime: "Escape",
	toggleTime2: "F5"
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
			window.setTimeout(time.updateTime, 100);
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
			event.preventDefault();
			if (event.shiftKey) {
				score.addPoint(-1, 0);
			} else {
				score.addPoint(1, 0);
			}
			break;
		case config.pointRight:
			event.preventDefault();
			if (event.shiftKey) {
				score.addPoint(0, -1);
			} else {
				score.addPoint(0, 1);
			}
			break;
		case config.reset:
			event.preventDefault();
			score.reset();
			time.reset();
			matchEnded = false;
			break;
		case config.toggleTime:
			event.preventDefault();
			time.toggleTime();
			break;
		case config.toggleTime2:
			event.preventDefault();
			time.toggleTime();
			break;
	}
}

window.onload = function(){
	document.onkeypress = keyHandle;
}
