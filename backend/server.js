import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
const { Client,Pool } = pkg;
import  pkg  from 'pg';
// import { sendStockAlert } from './sendStockAlert.js';

dotenv.config(); // Load environment variables
const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend access

import { RDSClient, DescribeDBInstancesCommand } from "@aws-sdk/client-rds";

const client = new RDSClient({
  region: process.env.AWS_REGION, // Change to your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

async function checkRDS() {
  try {
    const command = new DescribeDBInstancesCommand({});
    const response = await client.send(command);
    console.log("RDS Instances:", response.DBInstances);
  } catch (error) {
    console.error("Error fetching RDS instances:", error);
  }
}

checkRDS();


// ✅ Create "inventory" table if it doesn't exist
// const createTable = async () => {
//   const query = 
//     CREATE TABLE IF NOT EXISTS inventory (
//       productId SERIAL PRIMARY KEY,
//       name VARCHAR(255) NOT NULL,
//       stock INT NOT NULL CHECK (stock >= 0),
//       price DECIMAL(10, 2) NOT NULL
//     );
//   ;
//   await pool.query(query);
//   console.log("✅ Inventory table ensured");
// };

// createTable();

// // 📌 Add an Item to Inventory
// app.post("/add-item", async (req, res) => {
//   const { name, stock, price } = req.body;

//   if (!name || stock === undefined || price === undefined) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     const result = await pool.query(
//       "INSERT INTO inventory (name, stock, price) VALUES ($1, $2, $3) RETURNING *",
//       [name, stock, price]
//     );

//     // 🚨 Send stock alert if stock is low
//     if (stock < 5) {
//       await sendStockAlert(result.rows[0].productid, stock);
//     }

//     res.status(201).json({ message: "Item added successfully", item: result.rows[0] });
//   } catch (error) {
//     console.error("❌ Error adding item:", error);
//     res.status(500).json({ error: "Error adding item", details: error.message });
//   }
// });

// // 📌 Get an Item by ID
// app.get("/product/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("SELECT * FROM inventory WHERE productId = $1", [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error("❌ Error fetching item:", error);
//     res.status(500).json({ error: "Error retrieving item", details: error.message });
//   }
// });

// // 📌 Update Stock
// app.put("/update-stock/:id", async (req, res) => {
//   const { id } = req.params;
//   const { stock } = req.body;

//   if (stock === undefined) {
//     return res.status(400).json({ error: "Stock value is required" });
//   }

//   try {
//     const result = await pool.query(
//       "UPDATE inventory SET stock = $1 WHERE productId = $2 RETURNING *",
//       [stock, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     // 🚨 Send stock alert if stock is low
//     if (stock < 5) {
//       await sendStockAlert(id, stock);
//     }

//     res.json({ message: "Stock updated successfully", item: result.rows[0] });
//   } catch (error) {
//     console.error("❌ Error updating stock:", error);
//     res.status(500).json({ error: "Error updating stock", details: error.message });
//   }
// });

// // 📌 Delete an Item
// app.delete("/delete-item/:id", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query("DELETE FROM inventory WHERE productId = $1 RETURNING *", [id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Item not found" });
//     }

//     res.json({ message: "Item deleted successfully" });
//   } catch (error) {
//     console.error("❌ Error deleting item:", error);
//     res.status(500).json({ error: "Error deleting item", details: error.message });
//   }
// });

// 🌍 Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
