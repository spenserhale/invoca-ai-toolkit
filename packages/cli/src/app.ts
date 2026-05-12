import { buildApplication, buildRouteMap } from "@stricli/core";
import { agentContextCommand } from "./commands/agentContext.js";
import { configShowCommand } from "./commands/config/show.js";
import { feedbackCommand } from "./commands/feedback.js";
import { profileSaveCommand } from "./commands/profile/save.js";
import { profileListCommand } from "./commands/profile/list.js";
import { profileShowCommand } from "./commands/profile/show.js";
import { profileDeleteCommand } from "./commands/profile/delete.js";
import { jobsListCommand } from "./commands/jobs/list.js";
import { jobsGetCommand } from "./commands/jobs/get.js";
import { jobsPruneCommand } from "./commands/jobs/prune.js";
import { ringpoolRoutes, registerRingPoolSpecs } from "./commands/ringpool/index.js";
import { bulkRingpoolRoutes, registerBulkRingPoolSpecs } from "./commands/bulk-ringpool/index.js";
import { signalRoutes, registerSignalSpecs } from "./commands/signal/index.js";
import { transactionsRoutes, registerTransactionsSpecs } from "./commands/transactions/index.js";
import { CLI_VERSION } from "./version.js";

registerRingPoolSpecs();
registerBulkRingPoolSpecs();
registerSignalSpecs();
registerTransactionsSpecs();

const profileRoutes = buildRouteMap({
  routes: {
    save: profileSaveCommand,
    list: profileListCommand,
    show: profileShowCommand,
    delete: profileDeleteCommand,
  },
  docs: { brief: "Manage named profiles" },
});

const jobsRoutes = buildRouteMap({
  routes: {
    list: jobsListCommand,
    get: jobsGetCommand,
    prune: jobsPruneCommand,
  },
  docs: { brief: "Inspect the local jobs ledger" },
});

const configRoutes = buildRouteMap({
  routes: {
    show: configShowCommand,
  },
  docs: { brief: "Inspect the resolved CLI configuration" },
});

const routes = buildRouteMap({
  routes: {
    "agent-context": agentContextCommand,
    feedback: feedbackCommand,
    config: configRoutes,
    profile: profileRoutes,
    jobs: jobsRoutes,
    ringpool: ringpoolRoutes,
    "bulk-ringpool": bulkRingpoolRoutes,
    signal: signalRoutes,
    transactions: transactionsRoutes,
  },
  docs: { brief: "Invoca Platform Tools" },
});

export const app = buildApplication(routes, {
  name: "invoca",
  versionInfo: { currentVersion: CLI_VERSION },
});
