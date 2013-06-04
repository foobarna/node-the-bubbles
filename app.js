var http = require("http");
var url = require("url");
var express = require("express");
var request = require("request");
var socket = require("socket.io");
var redis = require("redis");
var redisClient = redis.createClient();
var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

app.use(express.static(__dirname));

var storeChatter = function(name) {
	redisClient.sadd("chatters", name);
};

var deleteChatter = function(name) {
	redisClient.srem("chatters", name);
};

redisClient.del("chatters");

io.sockets.on("connection", function(client) {
	console.log("Client connected...");

	client.on("join", function(nickname) {
		if(nickname === null) return;

		client.set("nickname", nickname);

		console.log("and his nickname is: " + nickname + " ...");

		storeChatter(nickname);
		redisClient.smembers("chatters", function(err, chatters_list){
			chatters_list.forEach(function(chatter) {
				client.emit("add chatter", chatter);
			});
		});

		client.broadcast.emit("add chatter", nickname);
	});

	client.on("chatter message", function(message) {
		client.get("nickname", function(err, name) {
			client.broadcast.emit("chatter message", name, message);
			client.emit("chatter message", name, message);
			console.log(name + " said '" + message + "'");
		});
	});

	client.on("disconnect", function(data) {
		client.get("nickname", function(err, name) {
			console.log("disconnected from chatter : " + name);
			client.broadcast.emit("remove chatter", name);
			deleteChatter(name);
		});
		redisClient.smembers("chatters", function(err, chatters_list){
			console.log("members :" + chatters_list);
		});
	});

	// client.emit("messages", { buff: "Welcome!"});
});


app.get("/", function(req, response) {
	console.log("requested...");
	response.sendfile(__dirname + "/chat.html");
});

server.listen(8080);
