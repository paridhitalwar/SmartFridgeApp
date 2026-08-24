import express from 'express';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);
import { postRoutes } from './routes/postRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { searchRoutes } from './routes/searchRoutes.js';
import { fridgeRoutes } from './routes/fridgeRoutes.js';
import { pantryRoutes } from './routes/pantryRoutes.js';
import { dayRoutes } from './routes/dayRoutes.js';
import { recipeRoutes } from './routes/recipeRoutes.js';
import { aiRoutes } from './routes/aiRoutes.js';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());

app.use(cors());

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/fridge', fridgeRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/day', dayRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/ai', aiRoutes);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/demo_db';
mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.warn('Failed to connect to MongoDB, starting server anyway:', err.message);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../CS633-Team-2/dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`listening on port ${PORT}`);
});
