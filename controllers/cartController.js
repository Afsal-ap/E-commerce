
const Product = require("../models/productmodel")
const cartModel = require("../models/cartModel");
const offerModel = require('../models/offerModel')

const getCart = async(req,res) => {
    try {
       
        if(req.session.user_id){
            console.log("van");  
            const product_id = req.body.id
            const userid = req.session.user_id
            const productData = await Product.findById(product_id)
            const cartProduct = await cartModel.findOne({ user:userid, 'product.productId':product_id})
            const productPrice = productData.discountedPrice ? productData.discountedPrice : productData.price
            console.log(productData.price ,"gtnew");
                if(productData.quantity > 0){
                if(cartProduct){
                    res.json({ status : 'aalreadyAdded', cartProduct})
                }else{
                    const data = {
                        productId : product_id,
                        price :productPrice,
                        totalPrice : productPrice,

                    }
                    console.log(data,"cart");

                    const cartdataa = await cartModel.findOneAndUpdate(
                        { user: userid },
                        {
                            $set: { user: userid },
                            $push: { product: data }
                        },
                        { upsert: true, new: true }
                    );

                    console.log(cartdataa);

                    res.json({success:true})
                }
            }
            else {
                res.json({ stock:true})
            }
        }

       else {
        res.json({failed:true})
       }

    } catch (error) {
        console.log(error.message)
    }
}


const showCart = async(req,res) => {
    try{

        if(req.session.user_id){
            const id = req.session.user_id
            const cartData = await cartModel.findOne({ user : id}).populate('product.productId')
            let subtotal;
            if(cartData){

                subtotal = cartData.product.reduce((acc, product) => acc + product.totalPrice, 0);
                console.log(subtotal,"rr");
            }
                res.render('user/cart',{cartData,subtotal})
        } 
    } catch(error){
        console.log(error.message);  
    }
}


const removeCart = async (req,res) =>{
    try{
     const  productId  = req.body.productId 

     const userId = req.session.user_id 
     
     const updateCart = await cartModel.findOneAndUpdate({user: userId},{$pull :{ 'product' : {'_id' : productId }}}, {new : true})
     console.log(updateCart,'siu');
     if(updateCart){
        res.json({success : true })
     }else{
        res.status(404).json({ error : 'product not found in cart'})
     }
    }catch (error){
        console.log(error.message);
    }
}

 const updateCart = async (req, res) => {
    try{
        const user_id = req.session.user_id
        const product_id = req.body.productId
        const count = req.body.count
        const productCount = await Product.findOne({ _id:product_id })
        
        const cartUs = await cartModel.findOne({ user : user_id})

        if ( count === -1){
            const currentQuantity = cartUs.product.find((p) => p.productId == product_id).quantity;
            if (currentQuantity <= 1){
                return res.json({ success: false, message:'  Quantity cannot be decreased further'})
                
            }
        }
        if (count === 1){
            const currentQuantity = cartUs.product.find((p) => p.productId == product_id).quantity
            if(currentQuantity + count > productCount.quantity) {
                
                return res.json({ success: false, message: 'stock limit reached'})
               
            }
        }
        const updatedCart = await cartModel.findOneAndUpdate(
            { user: user_id, 'product.productId': product_id},
            { $inc:{
                'product.$.quantity': count,
                'product.$.totalPrice': count * cartUs.product.find(p => p.productId.equals(product_id)).price,
            },},
            { new:true})


        const subtotal = updatedCart.product.reduce((acc, product) => acc + product.totalPrice, 0);
        console.log(subtotal,'total ');
        res.json({ success : true,subtotal})
    } catch(error) {

        console.log(error);
        res.status(500).render('500')
    }
 }

module.exports = {
    getCart,
    showCart,
    removeCart,
    updateCart
}