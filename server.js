require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path'); // Import the 'path' module

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

// Proxy for the findByIngredients endpoint
app.get('/api/recipes/findByIngredients', async (req, res) => {
    try {
        const { ingredients, number = 15 } = req.query;
        if (!ingredients) {
            return res.status(400).json({ error: 'Missing ingredients parameter' });
        }

        const apiKeyParam = `apiKey=${SPOONACULAR_API_KEY}`;
        const ingredientsParam = `ingredients=${encodeURIComponent(ingredients)}`;
        const numberParam = `number=${parseInt(number)}`;

        const apiUrl = `${SPOONACULAR_BASE_URL}/recipes/findByIngredients?${ingredientsParam}&${numberParam}&${apiKeyParam}`;

        const response = await axios.get(apiUrl);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recipes by ingredients:', error);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch recipes' });
    }
});

// Serve index.html on the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});