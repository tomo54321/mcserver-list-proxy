const fetch = require('node-fetch');

console.log(`Starting sockets`);
const socketServer = require("./servers/socketserver.js").socketServer;

console.log(`Downloading random servers`);

fetch(require("./config").SITE + "/api/server/proxy/random")
.then(data => data.json())
.then(data => {
    require("./config").servers = data;

    console.log(`Starting gameserver`);
    require("./servers/gameserver.js");
}).catch(e => {
    console.error(e);
    process.exit();
});
