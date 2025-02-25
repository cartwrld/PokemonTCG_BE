import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pokemonRoutes from "./routes/pokemonRoutesOG";
import axios from "axios"

const router = express.Router()

dotenv.config()
const app = express()
const PORT = process.env.PORT || 3000
const API_URL = process.env.API_URL || 'https://api.pokemontcg.io/v2/cards'

app.use(express.json());

// middleware
app.use(cors());
app.use(express.json());
app.use("/pokemon", pokemonRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Inventory API');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
