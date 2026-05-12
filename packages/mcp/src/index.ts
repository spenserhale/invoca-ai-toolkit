import { FastMCP } from "fastmcp";
import { registerRingPoolTools } from "./tools/ringPool.js";
import { registerBulkRingPoolTools } from "./tools/bulkRingPool.js";
import { registerSignalTools } from "./tools/signal.js";
import { registerTransactionsTools } from "./tools/transactions.js";

export const server = new FastMCP({
  name: "invoca-toolkit",
  version: "0.1.0",
});

registerRingPoolTools(server);
registerBulkRingPoolTools(server);
registerSignalTools(server);
registerTransactionsTools(server);

server.start({ transportType: "stdio" });
