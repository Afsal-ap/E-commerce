  const mongoose = require('mongoose')
 

  const categorySchema = mongoose.Schema({

    name : {
        type : String,
        required : true,
        unique  : true
    
    },
    description :{
        type : String,
        required:true
    },
    is_blocked:{
        type:Boolean,
        required : true
    }
  })
  
 
   categoryModel = mongoose.model('categoryModel',categorySchema)

   module.exports = categoryModel