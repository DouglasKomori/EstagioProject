import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';

import { setIo } from './socketManager.js';

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
import movimentacaoRoute from './routes/movimentacaoRoute.js';
import pixRoute from './routes/pixRoute.js';

const require = createRequire(import.meta.url);
const outputJson = require("./swaggerOutput.json");

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

const corsOptions = {
    credentials: true,
    origin: process.env.FRONTEND_URL || "http://localhost:3000"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    socket.on('join-comanda', (comandaId) => {
        socket.join(`comanda-${comandaId}`);
    });
    socket.on('leave-comanda', (comandaId) => {
        socket.leave(`comanda-${comandaId}`);
    });
});

setIo(io);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(outputJson));

app.use("/usuario", usuarioRoute);
app.use("/autenticacao", authRoute);
app.use("/servicos", servicosRoute);
app.use("/produtos", produtoRoute);
app.use("/marcas", marcaRoute);
app.use("/pessoas", pessoaRoute);
app.use("/agendamentos", agendaRoute);
app.use("/bloqueios", bloqueioRoute);
app.use("/disponibilidade", disponibilidadeRoute);
app.use("/comandas", comandaRoute);
app.use("/caixas", caixaRoute);
app.use('/estoque', movimentacaoRoute);
app.use('/pix', pixRoute);

httpServer.listen(PORT, function () {
    console.log(`backend em funcionamento na porta ${PORT}!`);
});
