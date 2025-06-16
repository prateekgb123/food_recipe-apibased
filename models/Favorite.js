const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipeId: String,
    title: String,
    image: String,
});

module.exports = mongoose.model("Favorite", FavoriteSchema);
