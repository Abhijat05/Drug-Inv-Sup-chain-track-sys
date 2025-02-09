import { config } from 'dotenv';
import bodyParser from 'body-parser';
config({ path: 'D:\\javasript\\drug sys\\backend\\.env' });

import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';


app.use(bodyParser.json());
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN
  }
});

const convertToDynamoDBFormat = (item) => {
  const formattedItem = {};
  for (const key in item) {
    if (typeof item[key] === 'string') {
      formattedItem[key] = { S: item[key] };
    } else if (typeof item[key] === 'number') {
      formattedItem[key] = { N: item[key].toString() };
    } else if (typeof item[key] === 'boolean') {
      formattedItem[key] = { BOOL: item[key] };
    } else if (Array.isArray(item[key])) {
      formattedItem[key] = { L: item[key].map(value => ({ S: value.toString() })) };
    } else {
      throw new Error(`Unsupported data type for key: ${key}`);
    }
  }
  return formattedItem;
};

const LOW_STOCK_THRESHOLD = 10; // Set the low stock threshold here

// Function to add an item dynamically
app.post("/add-item", async (req, res) => {
  const { tableName, item } = req.body;

  if (!tableName || !item) {
    return res.status(400).json({ error: "tableName and item fields are required" });
  }

  // Check if product exists to get current stock value
  const checkStockParams = {
    TableName: tableName,
    Key: { productId: { S: item.productId } }
  };

  try {
    // Retrieve the item from the database
    const getCommand = new GetItemCommand(checkStockParams);
    const existingItem = await client.send(getCommand);

    let currentStock = existingItem.Item ? parseInt(existingItem.Item.stock.N) : 0;
    let newStock = currentStock + parseInt(item.stock);

    // Send low stock warning if needed
    if (newStock <= LOW_STOCK_THRESHOLD) {
      console.log(`⚠️ Low stock for ${item.name} (Stock remaining: ${newStock})`);
      // You can replace this with an actual email/SMS notification system if needed
    }

    // Proceed to add item to DynamoDB
    const params = {
      TableName: tableName,
      Item: convertToDynamoDBFormat(item), // Function to convert item fields into DynamoDB format
    };

    const command = new PutItemCommand(params);
    const data = await client.send(command);
    res.status(201).json({ message: "Item added successfully", data });

  } catch (error) {
    console.error("Error adding item to DynamoDB:", error);
    res.status(500).json({ error: "Error adding item", details: error.message });
  }
});
const getItemFromDynamoDB = async (productId) => {
  const params = {
      TableName: "inventory",
      Key: {
          productId: { S: productId }
      }
  };

  try {
      const command = new GetItemCommand(params);
      const data = await client.send(command);
      
      return data.Item ? data.Item : null;
  } catch (error) {
      console.error("Error reading item from DynamoDB:", error);
      throw error;
  }
};

// HTTP GET request to fetch product by ID
app.get('/product/:id', async (req, res) => {
  try {
      const productId = req.params.id;
      const item = await getItemFromDynamoDB(productId);

      if (!item) {
          return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product retrieved successfully", data: item });
  } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
  }
});

  
  // Usage example with a productId of '12345'
  
//   addItemToDynamoDB()