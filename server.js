require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const Favorite = require("./models/Favorite");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Database connection
mongoose.connect(MONGO_URI, { dbName: "FOOD" })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// Middlewares
app.use(cors());
app.use(express.json());

// Schema & Model
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists. Please log in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "Signup successful! Please log in." });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ message: "Invalid credentials. Please sign up first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, username: user.username });
});

// JWT Auth middleware
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Search Recipes
app.get("/api/recipes/findByIngredients", authenticate, async (req, res) => {
    try {
        const { ingredients, number = 15 } = req.query;
        if (!ingredients) return res.status(400).json({ error: "Missing ingredients parameter" });

        const apiUrl = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${number}&apiKey=${process.env.SPOONACULAR_API_KEY}`;
        const response = await axios.get(apiUrl);

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching recipes:", error);
        res.status(500).json({ error: "Failed to fetch recipes" });
    }
});

// Add to favorites
app.post("/api/favorites", authenticate, async (req, res) => {
    try {
        const { recipeId, title, image } = req.body;

        const existing = await Favorite.findOne({ userId: req.user.userId, recipeId });
        if (existing) {
            return res.status(400).json({ message: "Already in favorites." });
        }

        const newFav = new Favorite({
            userId: req.user.userId,
            recipeId,
            title,
            image,
        });
        await newFav.save();
        res.json({ message: "Recipe added to favorites!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to save favorite." });
    }
});

// Get favorites
app.get("/api/favorites", authenticate, async (req, res) => {
    try {
        const favorites = await Favorite.find({ userId: req.user.userId });
        res.json(favorites);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch favorites." });
    }
});

// Remove from favorites
app.delete("/api/favorites/:recipeId", authenticate, async (req, res) => {
    try {
        const { recipeId } = req.params;

        const result = await Favorite.findOneAndDelete({
            userId: req.user.userId,
            recipeId
        });

        if (!result) {
            return res.status(404).json({ message: "Favorite not found." });
        }

        res.json({ message: "Recipe removed from favorites!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to remove favorite." });
    }
});

// Fallback for unmatched API routes
app.use("/api", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});

// Static file handler (AFTER all API routes)
app.use(express.static(path.join(__dirname, "public")));

// Frontend entry
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
