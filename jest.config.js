module.exports = {
    // Directorio raíz del proyecto
    rootDir: "./",
  
    // Extensiones de archivo que Jest debería reconocer
    moduleFileExtensions: ["js", "json", "jsx", "node"],
  
    // Patrones para incluir pruebas
    testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  
    // Excluir directorios y archivos específicos de las pruebas
    testPathIgnorePatterns: [
      "<rootDir>/coverage/", // Excluye el directorio de coverage
      "<rootDir>/node_modules/", // Excluye node_modules
      "<rootDir>/jest.config.js", // Excluye jest.config.js (si lo requiere)
      "<rootDir>/testconnection.js", // Excluye este archivo específico
    ],
  
    // Configuración para el reporte de cobertura
    collectCoverage: true,
    collectCoverageFrom: [
      "**/*.js", // Incluir todos los archivos .js
      "!<rootDir>/coverage/**", // Excluir todo el directorio coverage
      "!<rootDir>/jest.config.js", // Excluir jest.config.js
      "!<rootDir>/node_modules/**", // Excluir node_modules
      "!<rootDir>/testconnection.js", // Excluir testconnection.js
    ],
  
    // Directorio donde se guardará el reporte de cobertura
    coverageDirectory: "coverage",
    coverageReporters: ["json", "lcov", "text", "clover"],
  
    // Mostrar detalles en la consola
    verbose: true,
  
    // Transformar archivos antes de ejecutarlos
    transform: {
      "^.+\\.js$": "babel-jest",
    },
  
    // Ignorar rutas de módulos específicas
    modulePathIgnorePatterns: ["<rootDir>/coverage/", "<rootDir>/node_modules/"],
  };
  