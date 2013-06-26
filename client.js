$(document).ready(function() {
	var url = document.URL;
	var server = io.connect(url);

	var createMessage = function(nickname, message) {
        var msg = $("#messages");
        msg.append('<div class="chatter-message"><span class="nickname">' + nickname + "</span>" + "<br>" + '<span class="message">' + message + "</span>" + "</div><br>");
        msg.scrollTop(msg.get(0).scrollHeight);
	};

	var insertChatter = function(name) {
		var chatter = $('<li>' + name + "</li>").data("name", name);
		$("#chatters").append(chatter);
	};

	var removeChatter = function(name) {
        $("#chatters").find("li").filter(function() {
            if($(this).data("name") == name) $(this).remove();
        });
	};

	server.on("connect", function() {
		var nickname = prompt("What is your nickname?");

		if(nickname === null || nickname === "") return;

		server.emit("join", nickname);
	});


	server.on("chatter message", createMessage);
	server.on("add chatter", insertChatter);
	server.on("remove chatter", removeChatter);

	$("#btnSend").on('click', function() {
        var msgElem = $(this).parent().find("#messageInput");
        var message = msgElem.val();
		if(message === "") return;
        msgElem.val("");

		server.emit("chatter message", message);
	});

	$("#messageInput").keyup( function(e) {
		if(e.which == 13) $("#btnSend").click();
	});
});
