import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./utils/connectDB.js";
import mirrorRoutes from "./routes/mirrorRoutes.js";
import base64Routes from "./routes/base64Routes.js";
import cors from "cors";
import path from "path";

dotenv.config();

const PORT = process.env.PORT || 3101;
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const __dirname = path.resolve();

app.use(
  "/images",
  express.static(path.join(__dirname, "apiFunctions", "images"))
);

connectDB();

app.use("/", base64Routes);
app.use("/mirror", mirrorRoutes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
