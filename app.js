const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const squareClient = require('./config/square');

const profileRoutes = require('./routes/profile');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

connectDB();

app.use('/api/profile', profileRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/test', async (req, res) => {
  try {
    const response = await squareClient.locationsApi.listLocations();
    res.status(200).json(response.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
