import slugify from "slugify";
import productModel from "../model/productModel.js";
import fs from 'fs';
import braintree from "braintree";
import orderModel from "../model/orderModel.js";
import dotenv from "dotenv"

dotenv.config();

var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHANT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});



const createProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;

        switch (true) {
            case !name:
                return res.status(401).send({ message: 'name is required' });

            case !description:
                return res.status(401).send({ message: 'name is required' });

            case !price:
                return res.status(401).send({ message: 'price is required' });

            case !category:
                return res.status(401).send({ message: 'category is required' });

            case !quantity:
                return res.status(401).send({ message: 'quantity is required' });

            case photo && photo.size > 1000000:
                return res.status(401).send({ message: 'photo size less than 1mb is required' });

        }

        const product = await productModel({ ...req.fields, slug: slugify(name) });

        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();

        res.status(201).send({
            success: true,
            message: 'product created succesfully',
            product
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'error while creating product'
        })
    }
}

const getProductController = async (req, res) => {
    try {

        // code below this line is improvised needs review in case of any error

        const products = await productModel.find({}).select('-photo').populate('category');
        res.status(200).send({
            success: true,
            message: "successfully get products",
            totalCount: products.length,
            products
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "error in get product"
        })
    }
}

const getSingleProductController = async (req, res) => {

    try {

        const product = await productModel.findOne({ slug: req.params.slug }).select('-photo').populate('category')
        res.status(200).send({
            success: true,
            message: "product get succesfully",
            product
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "error while getting single product"
        })
    }

}

const getPhotoController = async (req, res) => {
    try {

        const product = await productModel.findById(req.params.pId).select('photo');
        if (product.photo.data) {
            res.set('content-type', product.photo.contentType)
            return res.status(200).send(product.photo.data)

        }

    } catch (error) {
        console.log(error);
        res.send({
            success: false,
            message: 'error while getting product photo',
            error
        })
    }
}

const deleteProductController = async (req, res) => {

    try {

        await productModel.findByIdAndDelete(req.params.pId).select('-photo')
        res.status(200).send({
            success: true,
            message: 'product deleted successfully'
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: true,
            message: 'error while deleting product',
            error
        })

    }

}

const updateProductController = async (req, res) => {

    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields;
        const { photo } = req.files;

        switch (true) {
            case !name:
                return res.status(401).res({ message: 'name is required' });

            case !description:
                return res.status(401).res({ message: 'name is required' });

            case !price:
                return res.status(401).res({ message: 'price is required' });

            case !category:
                return res.status(401).res({ message: 'category is required' });

            case !quantity:
                return res.status(401).res({ message: 'quantity is required' });

            case photo && photo.size > 1000000:
                return res.status(401).res({ message: 'photo size less than 1mb is required' });

        }

        const product = await productModel.findByIdAndUpdate(req.params.pId, { ...req.fields, slug: slugify(name) }, { new: true })

        if (photo) {
            product.photo.data = fs.readFileSync(photo.path);
            product.photo.contentType = photo.type;
        }

        await product.save();

        res.status(201).send({
            success: true,
            message: 'product updated succesfully',
            product
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: 'error while updating product'
        })
    }

}

const productFilterController = async (req, res) => {

    try {
        const { checked, radio } = req.body;

        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
        const products = await productModel.find(args)
        res.status(200).send({
            success: true,
            products
        })


    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error in filtering products",
            error
        })

    }

}

const braintreeTokenController = async (req, res) => {

    try {
        await gateway.clientToken.generate({}, (err, response) => {
            if (err) {
                res.status(400).send(err)
            } else {
                res.send(response)
            }
        })
    } catch (error) {
        console.log(error);

    }

}

const braintreePaymentController = async (req, res) => {

    try {
        const { cart, nonce } = req.body;
        let total = 0;
        cart.map((i) => {
            total += i.price;
        });

        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }

        }, (error, result) => {
            if (result) {
                const order = new orderModel({
                    products: cart,
                    payment: result,
                    buyer: req.user._id
                }).save()
                res.json({ ok: true })
            } else {
                res.status(400).send(error)
            }

        })

    } catch (error) {
        console.log(error);
    }

}



export {
    createProductController,
    getProductController,
    getSingleProductController,
    getPhotoController,
    deleteProductController,
    updateProductController,
    productFilterController,
    braintreeTokenController,
    braintreePaymentController,
};