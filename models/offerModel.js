const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    name : { type: String,
    required: true
},
 discountAmount :{
    type: Number
 },
 startDate : {
     type:Date,
     required:true
 },
 endDate:{ type: Date,
     required :true
    },
    is_blocked:{
        type: Boolean,
        default:false
    },
})

const offerModel = mongoose.model('offer',offerSchema)
module.exports = offerModel