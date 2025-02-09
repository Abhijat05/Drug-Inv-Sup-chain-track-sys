import express from 'express';
import cors from 'cors';
const app = express();
const port = 5000;
app.use(cors()); 
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  