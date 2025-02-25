import express from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();
const router = express.Router();
const prisma = new PrismaClient();

const API_URL = "https://api.pokemontcg.io/v2/cards";
const API_KEY = process.env.API_KEY;

router.get("/", async (req, res) => {
    try {
        const pokemonCards = await prisma.pokemonCard.findMany({
            orderBy: {cardID: 'asc'}
        });
        res.status(200).json(pokemonCards);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve accounts'});
    }
})
router.get("/sets", async (req, res) => {
    try {
        const sets = await prisma.set.findMany({
            orderBy: {setID: 'asc'}
        });
        res.status(200).json(sets);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve sets'});
    }
})
router.get("/abilities", async (req, res) => {
    try {
        const abilities = await prisma.ability.findMany({
            orderBy: {abilityID: 'asc'}
        });
        res.status(200).json(abilities);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve attacks'});
    }
})
router.get("/aboc", async (req, res) => {
    try {
        const abilityOnCard = await prisma.abilityOnCard.findMany({
            orderBy: {abocID: 'asc'}
        });
        res.status(200).json(abilityOnCard);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve AbilityOnCard'});
    }
})

router.get("/attacks", async (req, res) => {
    try {
        const attacks = await prisma.attack.findMany({
            orderBy: {attackID: 'asc'}
        });
        res.status(200).json(attacks);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve attacks'});
    }
})
router.get("/atoc", async (req, res) => {
    try {
        const attackOnCard = await prisma.attackOnCard.findMany({
            orderBy: {atocID: 'asc'}
        });
        res.status(200).json(attackOnCard);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve AttackOnCard'});
    }
})
router.get("/types", async (req, res) => {
    try {
        const types = await prisma.type.findMany({
            orderBy: {typeID: 'asc'}
        });
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve types'});
    }
})
router.get("/toc", async (req, res) => {
    try {
        const typeOnCard = await prisma.typeOnCard.findMany({
            orderBy: {tocID: 'asc'}
        });
        res.status(200).json(typeOnCard);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve TypeOnCard'});
    }
})

router.get("/woc", async (req, res) => {
    try {
        const weaknesses = await prisma.weaknessOnCard.findMany({
            orderBy: {wocID: 'asc'}
        });
        res.status(200).json(weaknesses);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve weaknesses'});
    }
})
router.get("/roc", async (req, res) => {
    try {
        const resistances = await prisma.resistanceOnCard.findMany({
            orderBy: {rocID: 'asc'}
        });
        res.status(200).json(resistances);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve resistances'});
    }
})
router.get("/pdn", async (req, res) => {
    try {
        const pokedexNumbers = await prisma.pokedexNumber.findMany({
            orderBy: {pdnID: 'asc'}
        });
        res.status(200).json(pokedexNumbers);
    } catch (error) {
        res.status(500).json({error: 'Could not retrieve pokedexNumbers'});
    }
})

/* ====================================== POSTS ====================================== */

// @ts-ignore
router.post("/addAll", async (req: Request, res: Response) => {
    try {
        for (let pokedexNumber = 1095; pokedexNumber <= 1250; pokedexNumber++) {
            console.log(`Fetching cards for Pokedex Number: ${pokedexNumber}`);

            // Fetch all cards for the given Pokédex number
            const response = await axios.get(`${API_URL}`, {
                headers: {"X-Api-Key": API_KEY},
                params: {q: `nationalPokedexNumbers:${pokedexNumber}`},
            });

            const cards = response.data.data;

            if (!cards || cards.length === 0) {
                console.log(`No cards found for Pokedex Number: ${pokedexNumber}`);
                continue; // Skip to the next iteration
            }

            console.log(`Found ${cards.length} cards for Pokedex Number: ${pokedexNumber}`);

            for (const card of cards) {
                // Insert the Set if it doesn't exist
                const set = await prisma.set.upsert({
                    where: { id: card.set.id },
                    update: {},
                    create: {
                        id: card.set.id,
                        setName: card.set.name,
                        series: card.set.series,
                    },
                });
                console.log(`Inserted Set: ${set.setName}`);

                // Insert Card
                const newCard = await prisma.pokemonCard.upsert({
                    where: { id: card.id },
                    update: {},
                    create: {
                        id: card.id,
                        cardNumber: parseInt(card.number) || 0,
                        name: card.name,
                        supertype: card.supertype ? card.supertype.replace("é", "e") : card.supertype,
                        hp: parseInt(card.hp) || 0,
                        evolvesFrom: card.evolvesFrom || null,
                        rarity: card.rarity || "Unknown",
                        convertedRetreatCost: card.convertedRetreatCost || 0,
                        imagesSmall: card.images.small,
                        imagesLarge: card.images.large,
                        retreatCost: card.retreatCost || [],
                        setName: card.set.name,
                        set: { connect: { setID: set.setID } },
                        nationalPokedexNumbers: {
                            create: card.nationalPokedexNumbers.map((num: number) => ({
                                number: num,
                            })),
                        },
                    },
                });

                console.log(`Created Card: ${newCard.name}`);

                // Insert Types
                for (const typeName of card.types || []) {
                    const type = await prisma.type.upsert({
                        where: { typeName },
                        update: {},
                        create: { typeName },
                    });

                    await prisma.typeOnCard.upsert({
                        where: {
                            unique_card_type: {
                                cardID: newCard.cardID,
                                typeID: type.typeID,
                            },
                        },
                        update: {},
                        create: {
                            cardID: newCard.cardID,
                            typeID: type.typeID,
                        },
                    });
                }

                // Insert Abilities
                for (const ability of card.abilities || []) {
                    const newAbility = await prisma.ability.upsert({
                        where: { abilityName: ability.name },
                        update: {},
                        create: {
                            abilityName: ability.name,
                            effect: ability.text || "",
                        },
                    });

                    await prisma.abilityOnCard.upsert({
                        where: {
                            unique_card_ability: {
                                cardID: newCard.cardID,
                                abilityID: newAbility.abilityID,
                            },
                        },
                        update: {},
                        create: {
                            cardID: newCard.cardID,
                            abilityID: newAbility.abilityID,
                        },
                    });
                }

                // Insert Attacks
                for (const attack of card.attacks || []) {
                    const newAttack = await prisma.attack.upsert({
                        where: { attackName: attack.name },
                        update: {},
                        create: {
                            attackName: attack.name,
                            convertedEnergyCost: attack.convertedEnergyCost,
                            damage: attack.damage || "",
                            text: attack.text || "",
                        },
                    });

                    await prisma.attackOnCard.upsert({
                        where: {
                            cardID_attackID: {
                                cardID: newCard.id,
                                attackID: newAttack.attackID,
                            },
                        },
                        update: {},
                        create: {
                            cardID: newCard.id,
                            attackID: newAttack.attackID,
                        },
                    });
                }

                // Insert Weaknesses
                for (const weakness of card.weaknesses || []) {
                    await prisma.weaknessOnCard.upsert({
                        where: {
                            cardID_type: {
                                cardID: newCard.id,
                                type: weakness.type,
                            },
                        },
                        update: {},
                        create: {
                            cardID: newCard.id,
                            type: weakness.type,
                            value: parseInt(weakness.value.replace("×", ""), 10) || 0,
                        },
                    });
                }

                // Insert Resistances
                for (const resistance of card.resistances || []) {
                    await prisma.resistanceOnCard.upsert({
                        where: {
                            cardID_type: {
                                cardID: newCard.id,
                                type: resistance.type,
                            },
                        },
                        update: {},
                        create: {
                            cardID: newCard.id,
                            type: resistance.type,
                            value: parseInt(resistance.value.replace("-", ""), 10) || 0,
                        },
                    });
                }
            }
        }

        return res.json({ message: "All cards for Pokedex numbers 101-500 have been added!" });
    } catch (error) {
        console.error("Error fetching Pokémon cards:", error);
        return res.status(500).json({ error: "Failed to fetch cards." });
    }
});

export default router;

