
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({ 
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    delivery_address: {
        type: Object,
        required:true
    },
    payment : {
        type : String,
        required:true,
        method: ['cash on delivery','Razorpay','Wallet']
    },
    paymentStatus: {
        type: String,
        default: 'pending',
        enum: ['pending', 'success', 'failure', 'cancelled', 'refunded']
    },
    products: [{
        productId:{
            type : mongoose.Types.ObjectId,
            ref: 'products',
            required: true
        },
        quantity: {
            type:Number,
            required: true
        },
        price: {
            type: Number,
            required:true
        },
        totalPrice: { 
            type: Number,
            default: 0
        }
    
    }],
    subtotal: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        default: 'pending',
        enum: ['pending','placed','returned or cancelled','delivered']
    },
    orederDate: {
        type: Date,
        required: true
    },
    wallet:{
        type:Number,
    }
})

const Order = mongoose.model('Orders',orderSchema)
module.exports = Order