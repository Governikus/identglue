/* eslint-disable */

// Karma configuration

var isCI = process.env.CI === "true";

module.exports = function (config) {
  if (isCI) {
    console.log("Starting karma in CI mode");
  }

  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    frameworks: ["jasmine-ajax", "jasmine"],

    // list of files / patterns to load in the browser
    files: [
      // The karma-rollup-preprocessor comes with its own file-watching.
      // Therefor, we disable karma's.
      { pattern: "test/**/*.spec.js", watched: false },
    ],

    // list of files / patterns to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      "test/**/*.spec.js": ["rollup"],
    },

    rollupPreprocessor: {
      plugins: [
        require("@rollup/plugin-babel").babel({
          babelHelpers: "bundled",
          presets: ["@babel/preset-env"],
          plugins: [
            "babel-plugin-transform-async-to-promises",
            "babel-plugin-istanbul",
          ],
        }),
        require("@rollup/plugin-node-resolve").nodeResolve(),
      ],
      output: {
        format: "iife",
        name: "AusweisApp2_Specs",
        sourcemap: "inline",
      },
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    reporters: ["progress", "coverage"],

    coverageReporter: {
      type: "lcov",
      dir: "reports",
      subdir: "coverage",
    },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: !isCI,

    // start these browsers
    browsers: ["ChromeHeadless", "FirefoxHeadless"],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: isCI,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,

    plugins: [
      "karma-jasmine-ajax",
      "karma-jasmine",
      "karma-coverage",
      "karma-chrome-launcher",
      "karma-firefox-launcher",
      "karma-rollup-preprocessor",
    ],
  });

  if (isCI) {
    config.set({
      browsers: ["ChromeHeadlessNoSandbox", "FirefoxHeadless"],
      customLaunchers: {
        ChromeHeadlessNoSandbox: {
          base: "ChromeHeadless",
          flags: [
            "--no-sandbox", // required to run without privileges in docker
            "--user-data-dir=/tmp/chrome-test-profile",
            "--disable-web-security",
          ],
        },
      },
    });
  }
};
