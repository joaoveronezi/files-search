import { SetupServer } from "./server";

const server = new SetupServer();

async function initServer() {
  server.init();
}

initServer();

export default server;
