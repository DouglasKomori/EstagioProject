import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'API para o projeto de estágio Barbearia', 
    description: 'Documentação da API para o sistema do Barber Uematsu',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:5000', 
      description: 'Servidor Local'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
        usuario: {
        $nome: "Douglas",
        $email: "douglas@email.com",
        $senha: "SenhaForte123!",
        $telefone: "(18) 98765-4321"
    }
  }
  },
};

const routes = ['./server.js']
const outputJson = './swaggerOutput.json';
swaggerAutogen({openapi: '3.0.0'})(outputJson, routes, doc)
.then(async () => {
  await import("./server.js");
})
