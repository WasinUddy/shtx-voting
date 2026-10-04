import { After, AfterAll, Before, BeforeAll } from "@cucumber/cucumber";
import type { CustomWorld } from "./world.js";
import {
  initializeTestDatabase,
  resetTestDatabase,
} from "./test-db.js";
import {
  startAcceptanceServer,
  stopAcceptanceServer,
} from "./server.js";

BeforeAll({ timeout: 300_000 }, async function () {
  initializeTestDatabase();
  await startAcceptanceServer();
});

AfterAll({ timeout: 60_000 }, async function () {
  await stopAcceptanceServer();
});

Before({ timeout: 60_000 }, async function (this: CustomWorld) {
  resetTestDatabase();
  await this.initBrowser();
});

After({ timeout: 30_000 }, async function (this: CustomWorld) {
  await this.disposeBrowser();
});
