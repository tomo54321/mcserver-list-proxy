const { Client, Server, PacketWriter, State } = require("mcproto");

new Server(async (player) => {

    const playerAddress = player.socket.remoteAddress.replace("::ffff:", "");
    const playerHandshake = await player.nextPacket();
    const playerProtocol = playerHandshake.protocol;

    const host = "51.77.84.76";
    const port = 25608;

    player.pause();

    const server = await Client.connect(host, port);

    server.send(new PacketWriter(0x0).writeVarInt(playerProtocol)
        .writeString(host).writeUInt16(port)
        .writeVarInt(player.state));

    player.resume();
    if(player.state == State.Status){
        player.on("packet", packet => server.send(packet));
        server.on("packet", packet => player.send(packet));    
        return;
    }

    player.unpipe();
    server.unpipe();
    player.socket.pipe(server.socket, { end: true });
    server.socket.pipe(player.socket, { end: true });


}).listen(25565);