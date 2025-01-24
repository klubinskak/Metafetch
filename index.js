const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const metadataRoute = require("./api/metadata");
const metadataBatchRoute = require("./api/batch");

const app = express();

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Metadata API",
      version: "1.0.0",
      description: "API to fetch metadata from a given URL",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://metafetch-api.vercel.app/"
            : "http://localhost:3000",
      },
    ],
  },
  apis: ["./api/*.js"], // Path to the API docs
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css";


app.use(
  "/swagger-ui",
  express.static(require("swagger-ui-dist").absolutePath())
);

// Swagger UI route
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss:
      ".swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }",
    customCssUrl: CSS_URL,
  })
);

// Routes
app.use("/api/metadata", metadataRoute);
app.use("/api/metadata", metadataBatchRoute);

module.exports = app;
