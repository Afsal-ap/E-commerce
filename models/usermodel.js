const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name :{
        type :String,
        required :true
    },
    email :{
        type :String,
        required :true
    },
    password :{
        type :String,
        required:true
    },
    number :{
        type :Number,
        required:true
    },
    verified :{
        type :Boolean,
        default:false
    },
    isAdmin :{
        type:Number,

        default:0,
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    wallet:{
        type:Number,
        default:0
    },
    walletHistory:[{
      date:{
        type:Date,

      },
      amount:{
        type:Number,
      }
    }],
    referralCode :{
        type:String
    }
})  

module.exports = mongoose.model('User',userSchema)