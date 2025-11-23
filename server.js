const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());

// Conexão com PostgreSQL local (XAMPP/pgAdmin)
const db = new Pool({
    user: "postgres",
    host: "localhost",
    database: "vestibular",
    password: "159357",
    port: 5432
});

app.post("/submit_result", async (req, res) => {
    try {
        const { nome, idade, acertos, set_tipo } = req.body;

        const query = `
            INSERT INTO resultados (nome, idade, acertos, set_tipo)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;

        const result = await db.query(query, [nome, idade, acertos, set_tipo]);

        res.json({ status: "OK", id: result.rows[0].id });

    } catch (err) {
        console.log("Erro ao salvar:", err);
        res.json({ error: "Erro ao salvar no banco." });
    }
});

// Página admin busca último registro
app.get("/get_results", async (req, res) => {
    try {
        const query = `
            SELECT * FROM resultados
            ORDER BY id DESC
            LIMIT 1;
        `;

        const result = await db.query(query);

        if (result.rows.length === 0)
            return res.json({ error: "Nenhum resultado encontrado." });

        res.json(result.rows[0]);

    } catch (err) {
        res.json({ error: "Erro ao consultar banco." });
    }
});

app.listen(3000, () => console.log("Servidor rodando em http://localhost:3000"));
