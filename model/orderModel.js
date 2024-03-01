import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    products: [
        {
            type: mongoose.ObjectId,
            ref: "Product"
        }
    ],
    payment: {},
    buyer: {
        type: mongoose.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        default: 'not processed',
        enum: ["not processed", "processing", "shipped", "delivered", "cancelled"]
    }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);