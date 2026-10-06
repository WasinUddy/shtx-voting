import { Given, Then, When } from "@cucumber/cucumber";
import { expect, type Page } from "playwright/test";
import type { CustomWorld } from "../support/world.js";

function requireObsPages(world: CustomWorld): {
  frame: Page;
  plate: Page;
  board: Page;
  pop: Page;
} {
  if (
    !world.obsFramePage ||
    !world.obsPlatePage ||
    !world.obsBoardPage ||
    !world.obsPopPage
  ) {
    throw new Error("OBS browser sources are not open");
  }
  return {
    frame: world.obsFramePage,
    plate: world.obsPlatePage,
    board: world.obsBoardPage,
    pop: world.obsPopPage,
  };
}

async function openObsSources(world: CustomWorld): Promise<void> {
  if (world.obsContext) {
    await world.obsContext.close();
  }
  world.obsContext = await world.browser.newContext({
    baseURL: world.baseUrl,
  });
  world.obsFramePage = await world.obsContext.newPage();
  world.obsPlatePage = await world.obsContext.newPage();
  world.obsBoardPage = await world.obsContext.newPage();
  world.obsPopPage = await world.obsContext.newPage();
  await world.obsFramePage.goto("/obs/frame?title=SHTX%20Live");
  await world.obsPlatePage.goto("/obs/plate");
  await world.obsBoardPage.goto("/obs/board");
  await world.obsPopPage.goto("/obs/pop");
}

Given("the OBS browser sources are open", async function (this: CustomWorld) {
  await openObsSources(this);
});

Then(
  'the OBS frame shows title {string}',
  async function (this: CustomWorld, title: string) {
    const { frame } = requireObsPages(this);
    await expect(frame.locator(".xp-titlebar__text")).toHaveText(title, {
      timeout: 15_000,
    });
    await expect(frame.locator('[data-obs="frame"]')).toBeVisible();
  },
);

Then("the OBS frame client area is transparent", async function (this: CustomWorld) {
  const { frame } = requireObsPages(this);
  const client = frame.locator('[data-obs="frame-client"]');
  await expect(client).toBeVisible();
  const clientBg = await client.evaluate((el) =>
    getComputedStyle(el).backgroundColor,
  );
  expect(clientBg).toBe("rgba(0, 0, 0, 0)");
  const bodyBg = await frame.evaluate(() =>
    getComputedStyle(document.body).backgroundColor,
  );
  expect(bodyBg).toBe("rgba(0, 0, 0, 0)");
});

Then("the OBS plate is not visible", async function (this: CustomWorld) {
  const { plate } = requireObsPages(this);
  await expect(plate.locator('[data-obs="plate"]')).toHaveCount(0, {
    timeout: 15_000,
  });
});

Then("the OBS board is not visible", async function (this: CustomWorld) {
  const { board } = requireObsPages(this);
  await expect(board.locator('[data-obs="board"]')).toHaveCount(0, {
    timeout: 15_000,
  });
});

Then("the OBS pop is not visible", async function (this: CustomWorld) {
  const { pop } = requireObsPages(this);
  await expect(pop.locator('[data-obs="pop"]')).toHaveCount(0, {
    timeout: 15_000,
  });
});

Then("the OBS pop stays hidden", async function (this: CustomWorld) {
  const { pop } = requireObsPages(this);
  await pop.waitForTimeout(1500);
  await expect(pop.locator('[data-obs="pop"]')).toHaveCount(0);
});

Then(
  'the OBS plate shows team {string} with score {string} and lean {string}',
  async function (
    this: CustomWorld,
    teamName: string,
    score: string,
    lean: string,
  ) {
    const { plate: platePage } = requireObsPages(this);
    const plate = platePage.locator('[data-obs="plate"]');
    await expect(plate).toBeVisible({ timeout: 20_000 });
    await expect(plate).toHaveAttribute("data-team", teamName);
    await expect(plate).toHaveAttribute("data-score", score);
    await expect(plate).toHaveAttribute("data-lean", lean);
  },
);

Then(
  'the OBS board row for {string} has score {string} and is active',
  async function (this: CustomWorld, teamName: string, score: string) {
    const { board } = requireObsPages(this);
    const row = board.locator(`[data-obs-row][data-team="${teamName}"]`);
    await expect(row).toHaveAttribute("data-score", score, { timeout: 20_000 });
    await expect(row).toHaveAttribute("data-active", "true");
  },
);

Then(
  "the OBS board lists teams in order: {string}, {string}",
  async function (this: CustomWorld, first: string, second: string) {
    const { board } = requireObsPages(this);
    const rows = board.locator("[data-obs-row]");
    await expect(rows).toHaveCount(2, { timeout: 20_000 });
    await expect(rows.nth(0)).toHaveAttribute("data-team", first);
    await expect(rows.nth(1)).toHaveAttribute("data-team", second);
  },
);

Then(
  'the OBS pop shows vote {string}',
  async function (this: CustomWorld, vote: string) {
    const { pop: popPage } = requireObsPages(this);
    const pop = popPage.locator('[data-obs="pop"]');
    await expect(pop).toBeVisible({ timeout: 20_000 });
    await expect(pop).toHaveAttribute("data-vote", vote);
  },
);

When("the OBS pop has dismissed", async function (this: CustomWorld) {
  const { pop } = requireObsPages(this);
  await expect(pop.locator('[data-obs="pop"]')).toHaveCount(0, {
    timeout: 10_000,
  });
});
