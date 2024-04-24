const offerModel = require('../models/offerModel')
const product = require('../models/productmodel')
const categoryModel = require('../models/categorymodel')

const loadOffer = async (req,res) =>{
    try{
        const page = parseInt(req.query.page) || 1;
        const pageSize = 3;
        const totalOffer = await offerModel.countDocuments();
        const totalPages = Math.ceil(totalOffer / pageSize);
       
        const offers = await offerModel.find({})
        .skip((page - 1) * pageSize)
        .limit(pageSize);

        res.render('offer',{offers , totalPages , currentPage : page })

    }catch(error){
        console.log(error);
    }
}

const addOffer = async(req,res) =>{
    try{
        res.render('addOffer')
    }catch(error){
        console.log(error);
    }
}

const addOfferPost = async (req,res) =>{
    try{
        const offerData = await offerModel.findOne({ name : req.body.offerName})

        if(offerData){
            res.render('addOffer',{message : 'This offer name already exists' })
        }else{
            const activationDate = new Date(req.body.actDate);
            const expiryDate = new Date(req.body.exDate);

            const newOffer = new offerModel({
                name : req.body.offerName,
                discountAmount:req.body.disPercentage,
                 startDate:activationDate,
                 endDate:expiryDate,
               
            })
            console.log(newOffer, 'bennu');
            await newOffer.save()
            res.redirect('/admin/offer')
        }
    }catch(error){
        console.log(error);
    }
}

const deleteOffer = async (req,res) => {
    try{
    const id = req.body.offerId
   
    const deletedOffer = await offerModel.deleteOne({_id:id})
    res.json({success:true})
    }catch(error){ 
    console.log(error)
    }
}
const applyOffer = async (req, res) => {
    try {
        const { offerId, productId } = req.body; 

         // Add offer to products 

        console.log(productId, 'hyy');
        const products = await product.findOneAndUpdate(
            { _id: productId },
            { $set: { offer: offerId } },
            { new: true }
        );
        res.json({ success: true });
        
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: 'An error occurred' });
    }
}

const removeOffer = async(req,res)=>{
    try {
        const { productId } = req.body; 
        const removeProduct = await product.findByIdAndUpdate(
            productId,
            { $unset: { offer: 1 },$set: { discountedPrice: null } },
            { new: true }
        );
       
        if (! removeProduct) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred' });
    }
}

const applyCategoryOffer = async(req,res)=>{ 
    try {
        const { offerId , categoryId } = req.body
        const categories = await categoryModel.findOneAndUpdate(
            { _id: categoryId },
            { $set: { offer: offerId } },
            { new: true }
        );
        res.json({ success: true });
    }catch(error){
        console.log(error);
    }
}

const removeCategoryOffer = async(req,res) => {
    try{
        const categoryId = req.body.categoryId
        
        const removeCategory = await categoryModel.findByIdAndUpdate(categoryId,{ $unset :{ offer :1}} ,{ new :true});
        
        console.log(categoryId);
        if (! removeCategory) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.json({ success: true });

    }catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'An error occurred' });
}

}


module.exports = {
    loadOffer,
    addOffer,
    addOfferPost,
    deleteOffer,
    applyOffer,
    removeOffer,
    applyCategoryOffer,
    removeCategoryOffer
}