import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DentRW API',
      version: '1.0.0',
      description: 'DentRW API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:5500/api',
        description: "local host server"
      },
      {
        url: 'https://todo-express-server-0yda.onrender.com/api',
        description: "Cloud server"
      }
    ],
  },
  apis: ['./src/documentation/swaggerAPIdocs.ts']
};

const specs = swaggerJsdoc(options);

const swaggerSetup = (app: any) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

export default swaggerSetup;