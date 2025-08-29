const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, 
  price: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  category: { type: String, default: "clothing" },
  description: { type: String, default: "" },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", productSchema);
