module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  globals: {
    appRoot: "..",
  },
  moduleNameMapper: {
    "^lib(.*)$": "<rootDir>/lib$1",
    "^src(.*)$": "<rootDir>/src$1",
    "^tests(.*)$": "<rootDir>/tests$1",
    "^components(.*)$": "<rootDir>/components$1",
    "\\.(css)$": "<rootDir>/tests/__mocks__/styleMock.js",
  },
  transform: {
    "\\.(js|ts|jsx|tsx)$": [
      "babel-jest",
      { configFile: "./babel.next.config.js" },
    ],
  },
  testPathIgnorePatterns: ["node_modules", "cypress"],
};
