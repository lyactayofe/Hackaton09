const express = require('express');
const cors = require('cors');
const apiService = require('./apiService');

const app = express();
app.use(cors()); // Importante para que tu HTML pueda hablar con Node
app.use(express.json());

// RUTA 1: GitHub
app.get('/api/github/:user', async (req, res) => {
    try {
        const data = await apiService.getGithubUser(req.params.user);
        res.json(data);
    } catch (e) { res.status(500).send(e.message); }
});

// RUTA 2: Dólar a Soles
app.get('/api/cambio', async (req, res) => {
    try {
        const data = await apiService.getExchangeRate();
        res.json(data);
    } catch (e) { res.status(500).send(e.message); }
});

// RUTA 3: Lista de Pokemones
app.get('/api/pokemones', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const data = await apiService.getPokemonList(limit);
        res.json(data);
    } catch (e) { res.status(500).send(e.message); }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ API Gateway corriendo en http://localhost:${PORT}`);
});