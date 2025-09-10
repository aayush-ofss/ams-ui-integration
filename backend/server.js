// server.js

import WebSocket, { WebSocketServer } from "ws";
import { spawn } from "child_process";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    const data = JSON.parse(msg.toString());
    console.log("User prompt:", data.message);

    const cline = spawn("cline", ["--chat"]); // Ensure 'cline' is installed and on your PATH!

    cline.stdin.write(data.message + "\n");
    cline.stdin.end();

    cline.stdout.on("data", (chunk) => {
      ws.send(JSON.stringify({ role: "ai", message: chunk.toString() }));
    });

    cline.stderr.on("data", (err) => {
      console.error("Cline error:", err.toString());
    });

    cline.on("close", (code) => {
      ws.send(JSON.stringify({ role: "system", message: `Cline exited with code ${code}` }));
    });
  });

  ws.on("close", () => console.log("Client disconnected"));
});

console.log(`Cline WebSocket wrapper running on ws://0.0.0.0:${PORT}`);