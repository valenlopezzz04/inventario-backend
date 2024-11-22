module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.js", // Incluye todos los archivos .js del proyecto
        "!**/node_modules/**",
        "!**/coverage/**",
        "!jest.config.js",
        "!**/testconfig/**",
        "!testconnection.js"
    ],
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover"],
    testEnvironment: "node",
    testPathIgnorePatterns: [
        "/node_modules/",
        "/coverage/",
        "/testconfig/",
        "/testconnection/",
        "!testconnection.js"
    ],
};
