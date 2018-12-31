'use strict';

var config = {
	lastKeyPressTime: 0,

	incPointLeft: "q",
	decPointLeft: "w",
	addPointRight: "i",
	decPointRight: "o",

	reset: ".",
	toggleTime: " ", // space
	toogleColors: "c",
	toogleOvertime: "y",

	enableDoublePress: true,
	doubePressDelay: 500,

	halfTime: 45 * 60, // in seconds
	endTime: 90 * 60, // in seconds

	handleKey: function(event) {
		if(document.activeElement.nodeName == "INPUT" || event.key == "F11"){
			// If we want to edit the teams names we don't grab the keyboard inputs
			return;
		}
		event.preventDefault();

		var keyPressTime = new Date();
		switch (event.key) {
			case config.incPointLeft:
					game.score.addPoint(1, 0);
				break;
			case config.decPointLeft:
					game.score.addPoint(-1, 0);
				break;
			case config.addPointRight:
					game.score.addPoint(0, 1);
				break;
			case config.decPointRight:
				game.score.addPoint(0, -1);
			break;
			case config.toogleOvertime:
				game.time.endOverTime()
			break;
			case config.reset:
				var isDoublePress = keyPressTime - this.lastKeyPressTime < config.doubePressDelay;
				this.lastKeyPressTime = keyPressTime;
				if (isDoublePress || !config.enableDoublePress) {
					game.reset();
				}
				break;
			case config.toggleTime:
				game.time.toggleTime();
				break;
			case config.toogleColors:
				game.toggleColors();
				break;
		}
	},

};

var game = {
	colorBlack: true,

	logStatus: function() {
		var minutesSeconds = this.time.convertToMinutesSeconds(this.time.currentTime);
		var logMessage = minutesSeconds[0] + ":" + minutesSeconds[1] + " " + this.score.scoreLeft + ":" + this.score.scoreRight;
		console.log(logMessage);
		scoreboard.logStatus(logMessage);
	},

	reset: function() {
		this.score.reset();
		this.time.reset();
	},

	score: {
		scoreLeft: 0,
		scoreRight: 0,

		addPoint: function(left, right) {
			this.scoreLeft += left;
			this.scoreRight += right;
			scoreboard.updateScore(this.scoreLeft, this.scoreRight);
			game.logStatus();
		},

		reset: function() {
			this.scoreLeft = 0;
			this.scoreRight = 0;
			scoreboard.updateScore(this.scoreLeft, this.scoreRight);
		}
	},

	toggleColors: function () {
		if (this.colorBlack) {
			this.setColor("black", "white");
		} else {
			this.setColor("white", "black");
		}
		this.colorBlack = !this.colorBlack;
	},

	setColor: function (backgroundColor, foregroundColor) {
		var nodes = document.querySelectorAll("body, html, input");
		nodes.forEach(function(node){
			node.style.color = foregroundColor;
			node.style.backgroundColor = backgroundColor;
		});
	},

	time: {
		secondHalf: false,
		overtimeIsOn: false,
		currentOvertime: 0,
		currentTime: 0,
		lastOverTimestamp: 0,
		lastTimestamp: 0,
		running: false,

		convertToMinutesSeconds: function(milliseconds) {
			var seconds = Math.round(milliseconds / 1000);
			var minutes = Math.floor(seconds / 60);
			seconds = (seconds % 60 < 10) ? "0" + seconds % 60 : seconds % 60;
			return [minutes, seconds];
		},

		reset: function() {
			this.overtimeIsOn = false;
			this.currentOvertime = 0;
			this.lastOverTimestamp = 0;

			this.currentTime = 0;
			this.lastTimestamp = 0;
			this.running = false;
			game.time.secondHalf = false;
			scoreboard.updateTime(this.convertToMinutesSeconds(this.currentTime));
			game.time.hideOvertime();
		},

		endOverTime: function() {
			if(game.time.secondHalf == false){
				game.time.secondHalf = true;

				this.overtimeIsOn = false;
				this.currentOvertime = 0;
				this.lastOverTimestamp = 0;

				this.currentTime = config.halfTime * 1000;
				this.lastTimestamp = 0;
				this.running = false;

				scoreboard.updateTime(this.convertToMinutesSeconds(this.currentTime));
				scoreboard.updateOvertime(game.time.convertToMinutesSeconds(game.time.currentOvertime));
				game.time.hideOvertime();
			} else {
				game.time.reset()
			}
		},

		start: function() {
			this.running = true;
			this.lastTimestamp = Date.now() - this.currentTime;
			this.lastOverTimestamp = Date.now() - this.currentOvertime;
			this.update();
		},

		stop: function() {
			this.running = false;
		},

		toggleTime: function () {
			if (this.running) {
				this.stop();
			} else {
				this.start();
			}
		},

		hideOvertime: function () {
			game.time.overtimeIsOn = false;
			document.getElementById("overtimeId").style.display = "none";
		},

		showOvertime: function () {
			game.time.overtimeIsOn = true;
			document.getElementById("overtimeId").style.display = "block";
		},

		toggleOvertime: function () {
			if(game.time.overtimeIsOn){
				game.time.hideOvertime();
			} else {
				game.time.showOvertime();
			}
			game.time.lastOverTimestamp = Date.now();
		},

		update: function(){
			if (game.time.running) {
				if(game.time.overtimeIsOn == false){
					if (game.time.currentTime >= config.halfTime * 1000 && game.time.secondHalf == false) {
						game.time.toggleOvertime();
						scoreboard.updateTime(game.time.convertToMinutesSeconds(config.halfTime));
					} else if (game.time.currentTime >= config.endTime * 1000) {
						game.time.toggleOvertime();
						scoreboard.updateTime(game.time.convertToMinutesSeconds(config.endTime));
					}
					game.time.currentTime = Date.now() - game.time.lastTimestamp;
					scoreboard.updateTime(game.time.convertToMinutesSeconds(game.time.currentTime));
				}
				else {
					game.time.currentOvertime = Date.now() - game.time.lastOverTimestamp;
					scoreboard.updateOvertime(game.time.convertToMinutesSeconds(game.time.currentOvertime));
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
	},

	updateOvertime: function(minutesSeconds) {
		document.getElementById("overtimeMinutesId").textContent = minutesSeconds[0];
		document.getElementById("overtimeSecondsId").textContent = minutesSeconds[1];
	}
};

window.onload = function(){
	document.onkeypress = config.handleKey;
}
