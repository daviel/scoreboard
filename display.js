'use strict';

var config = {
	lastKeyPressTime: 0,
	pointLeft: "PageUp",
	pointRight: "PageDown",
	reset: ".",
	toggleTime: "Escape",
	toggleTime2: "F5",

	enableDoublePress: true,
	doubePressDelay: 500,

	keySoundFilePath: "sound.ogg",

	maxScore: 5,
	maxTime: 300,

	handleKey: function(event) {
		event.preventDefault();

		var keyPressTime = new Date();
		switch (event.key) {
			case config.pointLeft:
				if (event.shiftKey) {
					game.score.addPoint(-1, 0);
				} else {
					game.score.addPoint(1, 0);
				}
				break;
			case config.pointRight:
				if (event.shiftKey) {
					game.score.addPoint(0, -1);
				} else {
					game.score.addPoint(0, 1);
				}
				break;
			case config.reset:
				var isDoublePress = keyPressTime - this.lastKeyPressTime < config.doubePressDelay;
				this.lastKeyPressTime = keyPressTime;
				if (isDoublePress || !config.enableDoublePress) {
					game.reset();
				}
				break;
			case config.toggleTime:
			case config.toggleTime2:
				game.time.toggleTime();
				break;
		}

		new Audio(config.keySoundFilePath).play();
		game.logStatus();
	},

	setMaxValues: function(maxScore, maxTime) {
		this.maxScore = maxScore;
		this.maxTime = maxTime;

		game.reset();
	}
};

var game = {
	matchEnded: false,

	endMatch: function() {
		if (this.time.running) {
			this.time.toggleTime();
		}

		game.matchEnded = true;
	},

	logStatus: function() {
		var minutesSeconds = this.time.convertToMinutesSeconds(this.time.currentTime);
		var logMessage = minutesSeconds[0] + ":" + minutesSeconds[1] + " " + this.score.scoreLeft + ":" + this.score.scoreRight;
		console.log(logMessage);
		scoreboard.logStatus(logMessage);
	},

	reset: function() {
		this.score.reset();
		this.time.reset();
		this.matchEnded = false;
	},

	score: {
		scoreLeft: 0,
		scoreRight: 0,

		addPoint: function(left, right) {
			if (!game.matchEnded) {
				this.scoreLeft += left;
				this.scoreRight += right;
				if (this.scoreRight >= config.maxScore || this.scoreLeft >= config.maxScore) {
					game.endMatch();
				}
				scoreboard.updateScore(this.scoreLeft, this.scoreRight);
			}
		},

		reset: function() {
			this.scoreLeft = 0;
			this.scoreRight = 0;
			scoreboard.updateScore(this.scoreLeft, this.scoreRight);
		}
	},

	time: {
		currentTime: 0,
		lastTimestamp: 0,
		running: false,

		convertToMinutesSeconds: function(milliseconds) {
			var seconds = Math.round(milliseconds / 1000);
			var minutes = Math.floor(seconds / 60);
			seconds = (seconds % 60 < 10) ? "0" + seconds % 60 : seconds % 60;
			return [minutes, seconds];
		},

		reset: function() {
			this.currentTime = 0;
			this.lastTimestamp = 0;
			this.running = false;
			scoreboard.updateTime(this.convertToMinutesSeconds(this.currentTime));
		},

		start: function() {
			this.running = true;
			this.lastTimestamp = Date.now() - this.currentTime;
			this.update();
		},

		stop: function() {
			this.running = false;
		},

		toggleTime: function () {
			if (!game.matchEnded) {
				if (this.running) {
					this.stop();
				} else {
					this.start();
				}
			}
		},

		update: function(){
			if (game.time.running) {
				game.time.currentTime = Date.now() - game.time.lastTimestamp;
				scoreboard.updateTime(game.time.convertToMinutesSeconds(game.time.currentTime));
				if (game.time.currentTime > config.maxTime * 1000) {
					game.endMatch();
				}
				window.setTimeout(game.time.update, 100);
			}
		}
	}
};

var scoreboard = {
	log: ["","",""],

	getSelectedMatchType: function() {
		var matchTypes = document.getElementsByName("matchTypes");
		var selectedMatchType;
		for (var i = 0; i < matchTypes.length; i++) {
			if(matchTypes[i].checked == true) {
				selectedMatchType = matchTypes[i].value;
				break;
			}
		}

		switch (selectedMatchType) {
			case "poolMatch":
				config.setMaxValues(5, 300);
				break;
			case "knockoutMatch":
				config.setMaxValues(10, 600);
				break;
		}
	},

	logStatus: function(logMessage) {
		for (var i = this.log.length - 1; i > 0; i--) {
			this.log[i] = this.log[i - 1];
		}
		this.log[0] = logMessage;

		var html = "";
		for (var i = this.log.length - 1; i >= 0; i--) {
			html += "<div>" + this.log[i] + "</div>";
		}
		document.getElementById("logId").innerHTML = html;
	},

	updateScore: function(scoreLeft, scoreRight) {
		document.getElementById("scoreLeftId").textContent = scoreLeft;
		document.getElementById("scoreRightId").textContent = scoreRight;
	},

	updateTime: function(minutesSeconds) {
		document.getElementById("minutesId").textContent = minutesSeconds[0];
		document.getElementById("secondsId").textContent = minutesSeconds[1];
	}
};

window.onload = function(){
	document.onkeypress = config.handleKey;
}
