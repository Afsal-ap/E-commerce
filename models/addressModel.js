const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const addressSchema = new mongoose.Schema({
    user:{
        type:ObjectId,
        ref:"User",
        require:true,
    },
    address:[{
        name:{
            type:String,
        },
        address:{
            type:String,
        },
        landmark:{
            type:String,
        },
        state:{
            type:String,
        },
        city:{
            type:String,
        },
        pincode:{
            type:String,
        },
        phone:{
            type:String,
        },
        email:{
            type:String,
        }
    }]
})

const addressModel = mongoose.model('addressModel',addressSchema)
module.exports = addressModel;