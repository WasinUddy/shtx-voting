import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "playwright/test";
import type { CustomWorld } from "../support/world.js";

async function signInAdmin(world: CustomWorld, password: string): Promise<void> {
  await world.adminPage.goto("/admin/login");
  await world.adminPage.locator("#admin-password").fill(password);
  await world.adminPage.getByRole("button", { name: "OK" }).click();
}

function sessionRow(world: CustomWorld, sessionName: string) {
  return world.adminPage
    .locator("a.xp-listview__row")
    .filter({ hasText: sessionName });
}

async function expectSessionDeskInProgress(world: CustomWorld): Promise<void> {
  await expect(
    world.adminPage.getByRole("button", { name: "End session" }),
  ).toBeVisible();
}

Given("the admin is logged in", async function (this: CustomWorld) {
  await signInAdmin(this, process.env.ADMIN_PASSWORD ?? "admin");
  await expect(this.adminPage.getByRole("heading", { name: "Sessions" })).toBeVisible();
});

Given("the admin is on the login page", async function (this: CustomWorld) {
  await this.adminPage.goto("/admin/login");
  await expect(this.adminPage.getByText("Log On to SHTX Voting")).toBeVisible();
});

When(
  "the admin signs in with password {string}",
  async function (this: CustomWorld, password: string) {
    await this.adminPage.locator("#admin-password").fill(password);
    await this.adminPage.getByRole("button", { name: "OK" }).click();
  },
);

Then("the admin sees the sessions console", async function (this: CustomWorld) {
  await expect(this.adminPage).toHaveURL(/\/admin\/?$/);
  await expect(this.adminPage.getByRole("heading", { name: "Sessions" })).toBeVisible();
});

Then(
  "the admin sees login error {string}",
  async function (this: CustomWorld, message: string) {
    await expect(this.adminPage.getByText(message)).toBeVisible();
  },
);

When(
  "the admin creates a session named {string}",
  async function (this: CustomWorld, sessionName: string) {
    if (!this.adminPage.url().includes("/admin")) {
      await this.adminPage.goto("/admin");
    }
    await this.adminPage.getByLabel("Session name").fill(sessionName);
    await this.adminPage
      .locator("form.xp-toolbar-form")
      .getByRole("button", { name: "Add" })
      .click();
    this.lastCreatedSessionName = sessionName;
    await expect(sessionRow(this, sessionName)).toBeVisible();
  },
);

Then(
  "the admin sees session {string} with status {string}",
  async function (this: CustomWorld, sessionName: string, status: string) {
    const row = sessionRow(this, sessionName);
    await expect(row).toBeVisible();
    await expect(row.locator(".xp-status-label")).toHaveText(status);
  },
);

When(
  "the admin opens session {string}",
  async function (this: CustomWorld, sessionName: string) {
    await sessionRow(this, sessionName).click();
    await expect(this.adminPage.getByRole("heading", { name: sessionName })).toBeVisible();
  },
);

When(
  "the admin adds team {string}",
  async function (this: CustomWorld, teamName: string) {
    await this.adminPage.getByLabel("New team name").fill(teamName);
    await this.adminPage
      .locator(".xp-toolbar-form")
      .getByRole("button", { name: "Add" })
      .click();
    await expect(this.adminPage.getByText(teamName, { exact: true })).toBeVisible();
  },
);

Then(
  "the admin sees team {string} in the session desk",
  async function (this: CustomWorld, teamName: string) {
    await expect(this.adminPage.getByText(teamName, { exact: true })).toBeVisible();
  },
);

When("the admin starts the session from the desk", async function (this: CustomWorld) {
  await this.adminPage.getByRole("button", { name: "Start session" }).click();
  await expectSessionDeskInProgress(this);
});

When("the admin ends the session from the desk", async function (this: CustomWorld) {
  await this.adminPage.getByRole("button", { name: "End session" }).click();
  await expect(this.adminPage.getByText("Final results")).toBeVisible();
});

Then(
  "the admin sees session status {string}",
  async function (this: CustomWorld, status: string) {
    await expect(this.adminPage.locator(".xp-status-label").first()).toHaveText(
      status,
    );
  },
);

Then(
  "the admin sees final results for the session",
  async function (this: CustomWorld) {
    await expect(this.adminPage.getByText("Final results")).toBeVisible();
  },
);

When("the admin goes back to the sessions list", async function (this: CustomWorld) {
  await this.adminPage.getByRole("link", { name: "Back" }).click();
  await expect(this.adminPage.getByRole("heading", { name: "Sessions" })).toBeVisible();
});

When(
  "the admin removes session {string}",
  async function (this: CustomWorld, sessionName: string) {
    this.adminPage.once("dialog", (dialog) => dialog.accept());
    const row = sessionRow(this, sessionName);
    await row.getByRole("button", { name: `Remove ${sessionName}` }).click();
    await expect(sessionRow(this, sessionName)).toHaveCount(0);
  },
);

Then(
  "the admin does not see session {string}",
  async function (this: CustomWorld, sessionName: string) {
    await expect(sessionRow(this, sessionName)).toHaveCount(0);
  },
);

Given(
  "the admin has a session {string} with teams {string} and {string} in progress",
  async function (
    this: CustomWorld,
    sessionName: string,
    teamOne: string,
    teamTwo: string,
  ) {
    await this.adminPage.goto("/admin");
    await this.adminPage.getByLabel("Session name").fill(sessionName);
    await this.adminPage
      .locator("form.xp-toolbar-form")
      .getByRole("button", { name: "Add" })
      .click();
    await sessionRow(this, sessionName).click();
    await this.adminPage.getByLabel("New team name").fill(teamOne);
    await this.adminPage
      .locator(".xp-toolbar-form")
      .getByRole("button", { name: "Add" })
      .click();
    await this.adminPage.getByLabel("New team name").fill(teamTwo);
    await this.adminPage
      .locator(".xp-toolbar-form")
      .getByRole("button", { name: "Add" })
      .click();
    await this.adminPage.getByRole("button", { name: "Start session" }).click();
    await expectSessionDeskInProgress(this);
  },
);

When(
  "the admin opens team {string} on stage",
  async function (this: CustomWorld, teamName: string) {
    const onStage = this.adminPage.locator(".xp-on-stage__name");
    if (await onStage.isVisible()) {
      const current = (await onStage.textContent())?.trim();
      if (current && current !== teamName) {
        const clearStage = this.adminPage.getByRole("button", {
          name: "Clear stage",
        });
        if (await clearStage.isVisible()) {
          await clearStage.click();
          await expect(
            this.adminPage.getByText("No team on stage. Use Next team or Open below."),
          ).toBeVisible({ timeout: 15_000 });
        }
      }
    }

    const rows = this.adminPage.locator(".xp-listview__row");
    const total = await rows.count();
    let opened = false;
    for (let index = 0; index < total; index += 1) {
      const row = rows.nth(index);
      const text = await row.innerText();
      if (!text.includes(teamName)) {
        continue;
      }
      const open = row.getByRole("button", { name: "Open" });
      if ((await open.count()) === 0) {
        continue;
      }
      await open.click();
      opened = true;
      break;
    }
    if (!opened) {
      throw new Error(`Could not open "${teamName}" on stage`);
    }
    await expect(onStage).toHaveText(teamName, {
      timeout: 15_000,
    });
  },
);

When("the admin clears the stage from the desk", async function (this: CustomWorld) {
  await this.adminPage.getByRole("button", { name: "Clear stage" }).click();
  await expect(
    this.adminPage.getByText("No team on stage. Use Next team or Open below."),
  ).toBeVisible({ timeout: 15_000 });
});

When("the admin advances to the next team on the desk", async function (this: CustomWorld) {
  await this.adminPage.getByRole("button", { name: "Next team" }).click();
  await expect(this.adminPage.locator(".xp-on-stage__name")).toBeVisible({
    timeout: 15_000,
  });
});

Then(
  "the admin sees team {string} with {int} vote and total score {string}",
  async function (
    this: CustomWorld,
    teamName: string,
    voteCount: number,
    totalScore: string,
  ) {
    const row = this.adminPage
      .locator(".xp-listview__row")
      .filter({ hasText: teamName });
    await expect(row).toContainText(String(voteCount));
    await expect(row).toContainText(totalScore);
  },
);
