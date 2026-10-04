/** @type {import('@cucumber/cucumber').IConfiguration} */
module.exports = {
  default: {
    paths: ["acceptance/features/**/*.feature"],
    requireModule: ["tsx/cjs"],
    require: [
      "acceptance/support/world.ts",
      "acceptance/support/hooks.ts",
      "acceptance/step-definitions/**/*.ts",
    ],
    format: ["progress"],
    publishQuiet: true,
  },
};
