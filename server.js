require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
const axios=require("axios");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI, { dbName: 'FOOD' })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);


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


app.get("/api/recipes/findByIngredients", authenticate, async (req, res) => {
    try {
        console.log("User:", req.user.username, "requested recipes.");
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


app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
