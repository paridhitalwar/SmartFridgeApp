import express from 'express';
import { suggestRecipes } from '../Controllers/aiController.js';

const router = express.Router();

router.post('/suggest-recipes', suggestRecipes);

export { router as aiRoutes };
