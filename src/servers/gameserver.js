const { Client, Server, PacketWriter, State } = require("mcproto");
const port = require("../config").PORT_GAME;

let servers = require("../config").servers;


const handlePlayerDisconnect = (addr) => {
    if(require("../config").connectedPlayers[addr] !== undefined){
        delete require("../config").connectedPlayers[addr];
    }
};

new Server(async player => {

    // Setup Variabls
    const playerAddress = player.socket.remoteAddress.replace("::ffff:", "");
    const handshake = await player.nextPacket();
    const protocol = handshake.readVarInt();
    const address = handshake.readString().split("\x00")[0];

    // Pick random server
    const serverAddr = servers[Math.floor(Math.random() * servers.length)];

    // Add player error event
    player.on("error", error => {
        console.log(error);
        handlePlayerDisconnect(playerAddress);
    });

    player.pause(); // Pause players connection Connection
    // Get the host and port from the address
    const { host, port } = serverAddr;
    let server;

    try {
        server = await Client.connect(host, port);
    }
    catch (error) {
        // Failed to connect to the server.
        
        if (player.state == State.Status) {
                player.send(new PacketWriter(0x0).writeJSON({
                    version: { name: "MCServer List", protocol: -1 },
                    players: { max: 0, online: 0 },
                    description: { text: "Selected server is offline, please refresh", color: "red" }
                }));
        } else if (client.state == State.Login) {
            player.end(new PacketWriter(0x0).writeJSON({ text: "Selected server is offline.", color: "red" }));
        }

        return;
    }

    server.on("error", error => {
        console.log("Server Connection Error");
        console.log(error);
    });
    
    // Connect to the endpoint server
    server.send(new PacketWriter(0x0).writeVarInt(protocol)
        .writeString(host).writeUInt16(port)
        .writeVarInt(player.state));

    if(player.state === State.Login){
        require("../config").connectedPlayers[playerAddress] = serverAddr;
    }


    // Player on disconnect
    player.on("end", function(){
        handlePlayerDisconnect(playerAddress);
    });

    player.on("packet", packet => server.send(packet));

    player.resume();
    player.unpipe(), server.unpipe();

    player.socket.pipe(server.socket, { end: true });
    server.socket.pipe(player.socket, { end: true });

}).listen(port);
console.log("Server listening on port " + port);
console.log();