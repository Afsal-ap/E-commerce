const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true      
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    categoryId:{
        type:objectId,
        ref:'categoryModel',
        required:true
    },
    description:{
        type:String,
        required:true
    },
    images:{
        image1:{
            type:String,
            required:true
        },
        image2:{
            type:String,
            required:true
        },
        image3:{
            type:String,
            required:true
        },
        image4:{
            type:String,
            required:true
        }

    },
    is_blocked:{
        type:Boolean,
        default:false,
        required:true
    },
    isCategoryBlocked:{
        type:Boolean,
        default:false
    }

})

module.exports = mongoose.model("products",productSchema);
