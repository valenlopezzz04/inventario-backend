module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        "**/*.js", // Incluye todos los archivos .js
        "!**/coverage/**", // Excluye el directorio coverage
        "!**/node_modules/**", // Excluye node_modules
        "!testconnection.js", // Excluye testconnection.js
        "!jest.config.js" // Excluye el archivo de configuración de Jest
    ],
    coverageDirectory: "coverage",
    testEnvironment: "node",
};
