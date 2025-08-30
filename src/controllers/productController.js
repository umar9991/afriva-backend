const Product = require("../models/ProductModel");

exports.getProducts = async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products" });
    }
  };
  
  exports.createProduct = async (req, res) => {
    try {
      const { name, image, price, rating } = req.body;
      const product = new Product({ name, image, price, rating });
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Error creating product" });
    }
  };