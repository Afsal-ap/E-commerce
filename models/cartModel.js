
const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:"User",
        require:true,
    },
    product:[{
        productId:{
            type:ObjectId,
            ref:"products",
            required:true
        },
        quantity:{
            type:Number,
            default:1
        },
        price:{
            type:Number,
            default:0
        },
        totalPrice:{
            type:Number,    
            default:0
        }
    }],
    couponDiscount : {
              type : mongoose.Schema.Types.ObjectId,
              ref : "Coupon",
              default : null,
         
    }
    })

    const cartModel = mongoose.model("cartMOdel",cartSchema)
    module.exports = cartModel