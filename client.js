$(document).ready(function() {
	var url = document.URL;
	var server = io.connect(url);

	var createMessage = function(nickname, message) {
		var messageDiv = '<div class="chatter-message"><span class="nickname">' + nickname + "</span>" + "<br>" + '<span class="message">' + message + "</span>" + "</div><br>";
		return messageDiv;
	};

	var insertChatter = function(name) {
		var chatter = $("<li data-name=\"" + name + "\">" + name + "</li>").data("name", name);
		$("#chatters").append(chatter);
	};

	var removeChatter = function(name) {
		$("#chatters li[data-name=" + name + "]").remove();
	};

	server.on("connect", function(data) {
		var nickname = prompt("What is your nickname?");

		if(nickname === null || nickname === "") return;

		server.emit("join", nickname);
	});

	server.on("chatter message", function(nick, msg) {
		var data = createMessage(nick, msg);
		// var messages = $("#messages").html();
		// messages += data;
		$("#messages").append(data);
	});

	server.on("add chatter", insertChatter);
	server.on("remove chatter", removeChatter);

	$("#btnSend").on('click', function() {
		var message = $("#messageInput").val();
		if(message === "") return;
		$("#messageInput").val("");

		server.emit("chatter message", message);
	});

	$("#messageInput").keyup( function(e) {
		if(e.witch == 13) {
			$("btnSend").click();
		}
	});
});
