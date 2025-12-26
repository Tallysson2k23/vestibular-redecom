const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Isso faz o Node servir seus arquivos HTML

const db = new Pool({
    user: "postgres",
    host: "localhost",
    database: "quiz",       // Nome da imagem image_aefdcf.png
    password: "159357",
    port: 5432
});

// Rota para salvar
app.post("/submit_result", async (req, res) => {
    try {
        const { nome, idade, acertos, set_tipo, respostas } = req.body;

        // Log para você ver o que está chegando no terminal
        console.log("Recebendo dados:", { nome, acertos, set_tipo });

        const query = `
            INSERT INTO respostas (nome, idade, acertos, classificacao, respostas, data_resposta)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id;
        `;

        // O JSON.stringify transforma o objeto de respostas em texto para o banco
        const values = [nome, idade, acertos, set_tipo, JSON.stringify(respostas)];

        const result = await db.query(query, values);
        
        console.log("✅ Salvo com sucesso! ID:", result.rows[0].id);
        res.json({ status: "OK", id: result.rows[0].id });

    } catch (err) {
        // ESSE LOG APARECERÁ NO TERMINAL DO VS CODE
        console.error("❌ ERRO REAL DO POSTGRES:", err.message); 
        res.status(500).json({ error: "Erro no banco de dados: " + err.message });
    }
});

// Rota para o Admin buscar todos
app.get("/submissions", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM respostas ORDER BY data_resposta DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar" });
    }
});

// Rota para o Thanks buscar o ÚLTIMO
app.get("/get_results", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM respostas ORDER BY id DESC LIMIT 1");
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Erro" });
    }
});

app.listen(3000, "0.0.0.0", () => {
    console.log("🚀 SERVIDOR ATIVO NA PORTA 3000");
});