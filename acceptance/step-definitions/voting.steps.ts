import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "playwright/test";
import type { CustomWorld } from "../support/world.js";

Given("the audience is on the voting page", async function (this: CustomWorld) {
  await this.voterPage.goto("/");
  await expect(this.voterPage.getByText("SHTX Popular Voting")).toBeVisible();
});

Then(
  "the audience sees {string}",
  async function (this: CustomWorld, message: string) {
    await expect(this.voterPage.getByText(message)).toBeVisible({
      timeout: 20_000,
    });
  },
);

Then(
  "the audience sees team {string} ready to vote",
  async function (this: CustomWorld, teamName: string) {
    await expect(this.voterPage.locator(".xp-vote-header__team")).toHaveText(
      teamName,
      { timeout: 20_000 },
    );
    await expect(this.voterPage.getByRole("button", { name: "+3" })).toBeEnabled({
      timeout: 20_000,
    });
  },
);

When(
  "the audience votes score {string}",
  async function (this: CustomWorld, score: string) {
    await this.voterPage.getByRole("button", { name: score }).click();
  },
);

Then(
  "the audience sees their vote as {string}",
  async function (this: CustomWorld, score: string) {
    await expect(this.voterPage.getByText(`Your vote: ${score}`)).toBeVisible({
      timeout: 15_000,
    });
  },
);
