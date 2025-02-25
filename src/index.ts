import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pokemonRoutes from "./routes/pokemonRoutes";
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


// router.get("/fetch-50-cards", async (req, res) => {
//     try {
//         const response = await axios.get(API_URL, {
//             headers: { "X-Api-Key": process.env.API_KEY },
//             params: { pageSize: 50 },
//         });
//
//         const cards = response.data.data;
//
//         console.log("Fetched 50 Pokémon cards:", cards);
//         res.json({ message: "Fetched 50 cards. Check the console!" });
//     } catch (error) {
//         console.error("Error fetching Pokémon cards:", error);
//         res.status(500).json({ error: "Failed to fetch cards." });
//     }
// });


// routes
// app.use('/accounts', accountsRouter);


app.get('/', (req, res) => {
    res.send('Welcome to the Inventory API');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
