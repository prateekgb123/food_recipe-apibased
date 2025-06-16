const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipeId: {
        type: String, // or Number if recipeId is numeric from Spoonacular
        required: true
    },
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Optional: Adds createdAt and updatedAt fields
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
