const express = require('express');
const cors = require('cors');
const authenticateToken = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const frontendUrl = 'https://xientech.vercel.app';

// 1. Use the middleware (remove the manual app.options block below this) this is for prod
// app.use(cors({
//   origin: frontendUrl,
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors()); // local

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send("Barangay API is running...");
});

const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Super Admin only." });
    }
};

const userRoutes = require('./routes/userRoutes');


app.use('/api/users', userRoutes);



//  uncomment for local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally at http://localhost:${PORT}`);
  });
}
// IMPORTANT: export app for vercel
module.exports = app;
