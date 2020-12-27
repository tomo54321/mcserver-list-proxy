
const CONFIG_PORT = require("../config").PORT_SOCKET;
const CONFIG_SITE = require("../config").SITE;
const io = require('socket.io')(CONFIG_PORT, {
	path: '/randomserver',
	serveClient: false,
	cors: {
		origin: CONFIG_SITE,
		methods: ["GET", "POST"]
	}
});

io.on("connection", (socket) => {
	sendUserServer(socket);

	socket.on("check server", () => {
		sendUserServer(socket);
	});
});

function sendUserServer(socket){
	// const playerAddress = socket.request.connection.remoteAddress.replace("::ffff:", "");
	const playerAddress = "127.0.0.1";
	if (require("../config").connectedPlayers[playerAddress] !== undefined) {
		socket.emit("new server", require("../config").connectedPlayers[playerAddress].id);
	} else {
		socket.emit("no server");
	}
}

console.log(`Listening on ${CONFIG_PORT}`);

exports.socketServer = io;