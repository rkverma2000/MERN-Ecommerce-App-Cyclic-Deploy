import express from "express";
import { createCategoryController, deleteCategoryController, getAllCategoriesController, getSingleCategoryController, updateCategoryController } from '../controllers/categoryController.js';
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/create-category', requireSignIn, isAdmin, createCategoryController);

router.put('/update-category/:id', requireSignIn, isAdmin, updateCategoryController);

router.get('/all-categories', getAllCategoriesController);

router.get('/single-category/:slug', getSingleCategoryController);

router.delete('/delete-category/:id', requireSignIn, isAdmin, deleteCategoryController);

export default router;
