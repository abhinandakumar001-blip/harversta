import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth/auth.routes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
import productRoutes from "./routes/products/product.routes.js";
app.use("/api/products", productRoutes);
import orderRoutes from "./routes/orders/order.routes.js";
app.use("/api/orders", orderRoutes);
import groupRoutes from "./routes/groupListings/group.routes.js";
app.use("/api/group-listings", groupRoutes);
import marketRoutes from "./routes/market/market.routes.js";
app.use("/api/market", marketRoutes);

app.get("/", (req, res) => {
   res.send("Server is running");
});

app.get("/health", (req, res) => {
   res.json({ status: "OK" });
});

const PORT = process.env.PORT;

const startServer = async () => {
   await connectDB()
   app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`)
   })
};

startServer()
