const WebSocket = require("ws");

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

const nodeMcus = new Set();
const unrealEngines = new Set();

wss.on("connection", function connection(ws, req) {
  console.log("New Client Connected:", req.socket.remoteAddress);

  ws.on("message", function incoming(message) {
    console.log("Received: %s", message);
    if (
      typeof message.toString() === "string" &&
      message.toString().startsWith("REGISTER:")
    ) {
      const role = message.toString().split(":")[1];
      console.log(role);

      if (role === "NODEMCU") {
        nodeMcus.add(ws);
        console.log("NodeMCU Registered (Total: " + nodeMcus.size + ")");
      } else if (role === "UNREAL") {
        unrealEngines.add(ws);
        console.log(
          "Unreal Engine Registered (Total: " + unrealEngines.size + ")"
        );
      }
    } else {
      // Forward messages from Unreal Engine(s) to all NodeMCUs
      if (unrealEngines.has(ws)) {
        console.log("Forwarding to NodeMCUs...");
        nodeMcus.forEach((client) => {
          console.log(client.readyState,WebSocket.OPEN);

          if (client.readyState === WebSocket.OPEN) {
            console.log(message.toString());
            client.send(message.toString());
          }
        });
      }
    }
  });

  ws.on("close", function () {
    console.log("Client Disconnected");
    nodeMcus.delete(ws);
    unrealEngines.delete(ws);
  });
});

console.log("WebSocket server running on ws://localhost:8080");
