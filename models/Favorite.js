const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipeId: {
        type: String, 
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
    timestamps: true 
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
