import express from 'express';
import formidable from 'express-formidable'
import { isAdmin, requireSignIn } from '../middlewares/authMiddleware.js';
import {
    braintreePaymentController,
    braintreeTokenController,
    createProductController,
    deleteProductController,
    getPhotoController,
    getProductController,
    getSingleProductController,
    productFilterController,
    updateProductController
} from '../controllers/productController.js';


const router = express.Router();

router.post('/create-product', requireSignIn, isAdmin, formidable(), createProductController);

router.put('/update-product/:pId', requireSignIn, isAdmin, formidable(), updateProductController);

router.get('/get-products', getProductController)

router.get('/single-product/:slug', getSingleProductController)

router.get('/product-photo/:pId', getPhotoController)

router.delete('/delete-product/:pId', deleteProductController)

router.post('/product-filter', productFilterController);

router.get('/braintree/token', braintreeTokenController);

router.post('/braintree/payment', requireSignIn, braintreePaymentController);



export default router;
