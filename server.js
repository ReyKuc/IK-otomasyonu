const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
connectDB();

const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminRoutes = require('./routes/adminRoutes'); 

const app = express();

app.use(cors());
app.use(bodyParser.json());


app.use('/api/auth', adminAuthRoutes);


app.use('/api/admin', adminRoutes); 

app.get('/', (req, res) => {
  res.send('IK Otomasyonu Backend Çalışıyor 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor 🚀`));
