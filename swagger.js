import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API with Swagger',
    version: '1.0.0',
    description: 'A simple API application made with Express and documented with Swagger',
  },
  servers: [
    {
      url: 'http://localhost:3000', // Replace with your server's URL
      description: 'Development server',
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Path to your API files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
  app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
