import { setWorldConstructor, World, type IWorldOptions } from "@cucumber/cucumber";
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from "playwright";
import { getBaseUrl } from "./server.js";

export class CustomWorld extends World {
  baseUrl = getBaseUrl();
  browser!: Browser;
  adminContext!: BrowserContext;
  voterContext!: BrowserContext;
  adminPage!: Page;
  voterPage!: Page;
  obsContext?: BrowserContext;
  obsFramePage?: Page;
  obsPlatePage?: Page;
  obsBoardPage?: Page;
  obsPopPage?: Page;
  lastCreatedSessionName?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async initBrowser(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.HEADED !== "1",
    });
    this.adminContext = await this.browser.newContext({
      baseURL: this.baseUrl,
    });
    this.voterContext = await this.browser.newContext({
      baseURL: this.baseUrl,
    });
    this.adminPage = await this.adminContext.newPage();
    this.voterPage = await this.voterContext.newPage();
  }

  async disposeBrowser(): Promise<void> {
    await this.obsContext?.close();
    this.obsContext = undefined;
    this.obsFramePage = undefined;
    this.obsPlatePage = undefined;
    this.obsBoardPage = undefined;
    this.obsPopPage = undefined;
    await this.adminContext?.close();
    await this.voterContext?.close();
    await this.browser?.close();
  }
}

setWorldConstructor(CustomWorld);
