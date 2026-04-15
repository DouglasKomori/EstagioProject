import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';

import authRoute from './routes/authRoute.js';
import usuarioRoute from './routes/usuarioRoute.js';
import servicosRoute from './routes/servicosRoute.js';
import produtoRoute from './routes/produtoRoute.js';
import marcaRoute from './routes/marcaRoute.js';
import pessoaRoute from './routes/pessoaRoute.js';
import agendaRoute from './routes/agendaRoute.js';
import bloqueioRoute from './routes/bloqueioRoute.js';
import disponibilidadeRoute from './routes/disponibilidadeRoute.js';
import comandaRoute from './routes/comandaRoute.js';
import caixaRoute from './routes/caixaRoute.js';

const require = createRequire(import.meta.url);
const outputJson = require("./swaggerOutput.json");
const server = express();

const PORT = process.env.PORT || 5000;

server.use(cors({
    credentials: true, 
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));

server.use(express.json());
server.use(cookieParser());

server.use("/docs", swaggerUi.serve, swaggerUi.setup(outputJson));

server.use("/usuario", usuarioRoute);
server.use("/autenticacao", authRoute);
server.use("/servicos", servicosRoute);
server.use("/produtos", produtoRoute);
server.use("/marcas", marcaRoute);
server.use("/pessoas", pessoaRoute);
server.use("/agendamentos", agendaRoute);
server.use("/bloqueios", bloqueioRoute);
server.use("/disponibilidade", disponibilidadeRoute);
server.use("/comandas", comandaRoute);
server.use("/caixas", caixaRoute);

server.listen(PORT, function() {
    console.log(`backend em funcionamento na porta ${PORT}!`);
});