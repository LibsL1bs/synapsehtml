import express from "express";
import cors from "cors";
import routes from "./routes.js";

const app = express();
app.use(cors())
app.use(express.json())

// Rota de saúde para teste rápido
app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.use(routes)


const PORT = Number(8001);

app.listen(PORT, () => {
        console.log(`Running now!! Listening on port ${PORT}`);
});

// Handler global para erros não tratados
process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        process.exit(1);
});