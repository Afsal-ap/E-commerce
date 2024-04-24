
const User = require('../models/usermodel')
const orderModel = require('../models/orderModel')
const addressModel = require('../models/addressModel')
const cartModel = require('../models/cartModel')
const Product = require('../models/productmodel')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const couponModel = require('../models/couponModel')
const { error } = require('console')
 
const razorpay = new Razorpay({
    key_id: 'rzp_test_1tR3oFB9bQGNx4',
    key_secret: 'HV5q2AC1tNHwum1lC2CuL6GM',
});

const loadCheckout = async (req,res) =>{
    try{
        if(!req.session.orderId){
            const deliveryCharge = 40
            const wallet = await User.findById(req.session.user_id);
            const cartData = await cartModel.findOne( {user: req.session.user_id}).populate('couponDiscount').populate('product.productId')
            const currentDate = new Date();
            const couponData = await couponModel.find({expiryDate : { $gte: currentDate }, is_blocked:false })
            const address = await addressModel.findOne({ user: req.session.user_id })
            const total = cartData.product.reduce((acc, val) => acc + val.totalPrice, 0);
            const subtotal = total + deliveryCharge
            
            console.log(cartData.product,"yes");
            const couponDiscount = cartData.couponDiscount ? cartData.couponDiscount.discountAmount : 0 ;
           
            const discountAmount = subtotal - couponDiscount;
           
            res.render('user/checkout',{address,cartData,subtotal,couponData,discountAmount,wallet})
        }else{
            delete req.session.orderId
            res.redirect('/showCart')
        }
    }catch(error){
        console.log(error);
}
}

const checkoutPost = async (req, res) => {

  
    try{
        const userId = req.session.user_id
        const user = await User.findOne({ _id: userId})
       
        const selectedAddress = req.body.selectedAddress
        const paymentMethod = req.body.paymentMethod;
        let status = paymentMethod == "cash on delivery" || paymentMethod == "wallet" ? "placed" : "pending";
        const orderItems = []
        const cartData = await cartModel.findOne({user: req.session.user_id}).populate('couponDiscount')

               
              for( const product of cartData.product){
                const { productId, quantity, price} = product;
                       
                
              

                for(let i = 0; i < quantity; i++){
                    const item = {
                        productId,
                        quantity:1,
                        price:price,
                        totalPrice:price,
                        productStatus:status,
                      

                      };
                    if(cartData.couponDiscount){
                      
                        const totalQuantity = cartData.product.reduce((total, product)=> total + product.quantity,0);
                        console.log(totalQuantity, 'quan');
                        const discountPerItem = cartData.couponDiscount.discountAmount / totalQuantity;
                        console.log(discountPerItem, "per");
                        item.totalPrice = price - discountPerItem
                    } else{
                        item.totalPrice = price;
                    }
                    orderItems.push(item);
                }
              }   
                 const totals = orderItems.reduce((acc,item) => acc + item.totalPrice,0)
                 var totalPrice = totals

                console.log(totalPrice,"total");

                if (selectedAddress === undefined || selectedAddress === null){
                    const { name, address, landmark, state, city, pincode, phone, email} = req.body;
                    const newAddress = {name, address, landmark, state, city, pincode, phone, email};
                    
                    const data = await addressModel.findOneAndUpdate(
                        { user: userId },
                        { $push : { address: newAddress } },
                        { upsert: true, new: true} 

                    )
                    addressObject = data.address[data.address.length - 1];
                }else{
                    const userAddress = await addressModel.findOne(
                        { 'address._id': selectedAddress},
                        { 'address.$':1} 
                    )
                    addressObject = userAddress.address[0];
                }
                

                const order  = new orderModel({
                    user: userId,
                    delivery_address: addressObject,
                    payment: paymentMethod,
                    products: cartData.product,
                    subtotal: totalPrice,
                    orderStatus: status,
                    orederDate: new Date()  
                });

                await order.save();
                const orderId = order._id;

                if (paymentMethod == "cash on delivery" && subtotal <= 1000) {
                    
                 
                    for(const item of cartData.product) {
                        await Product.updateOne(
                            { _id: item.productId },
                            { $inc: { quantity: -item.quantity } }
                        )
                    }
                    await cartData.deleteOne({ user: user._id });
                    res.json({ orderId, success: true })
                }else if(paymentMethod === 'wallet'){
                      const data = {
                        amount : -totalPrice,
                        date: new Date()
                      }
                     await orderModel.findOneAndUpdate({ _id: order._id},{ $set: { orderStatus: 'placed', paymentStatus :'success'}})
                     await User.findOneAndUpdate({_id: userId}, { $inc :{wallet: -totalPrice }, $push: {walletHistory: data}})
                     
                     for (const item of orderItems){
                        await Product.updateOne(
                            { _id: item.productId },
                            { $inc: { quantity: -item.quantity }}
                        );
                     }
                     await cartData.deleteOne({ user: user._id})
                     return res.json({ orderId, success: true})
                    }else{ 
                    let options = {
                        amount : totalPrice * 100,
                        currency: "INR",
                        receipt: ""+ orderId
                    }
                    razorpay.orders.create( options ,function (err, order){
                        if (err) {
                            console.log(err);
                            
                            orderModel.findByIdAndUpdate(orderId, { 
                                orderStatus: 'pending', 
                                paymentStatus: 'failure' 
                            }, (err, updatedOrder) => {
                                if (err) {
                                    console.log(err);  
                                    return res.status(500).json({ error: 'Failed to update order status' });
                                }
                                return res.json({ orderId, success: false, error: 'Payment failed. Please try again.' });
                            });
                        } else {  
                            
                            console.log("error", order);
                            res.json({ success: false, order });
                        }
                    });
                }
            
        } catch (error){
                    console.log(error);
                }
}


  // load success 
  const loadSuccess = async (req,res) => {
    try{
        res.render('user/success')
    }catch(error){
        console.log(error);
    }
  }


  // order details  

   const orderDetails = async (req,res) =>{
       

    const orderId = req.query.id
  
    try{
        const orderedItems = await orderModel.findOne({_id:orderId}).populate('products.productId')
       
        res.render('user/orderDetails',{ orderedItems })

    } catch(error){
        console.log(error);
    }
   }

   const cancelOrder = async (req, res) =>{

    try {
        const orderId = req.body.orderId;
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { $set: { orderStatus: 'cancelled' } },
            { new: true }
        );

        console.log(updatedOrder.subtotal,"gt");
        // Update product quantities

        for (const product of updatedOrder.products) {
            await Product.updateOne(
                { _id: product.productId },
                { $inc: { quantity: product.quantity } } 
            );
        }
        const refundAmount = updatedOrder.subtotal; 
        const userId = req.session.user_id;

        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.wallet += refundAmount;
        user.walletHistory.push({ date: new Date(), amount: refundAmount });
          
       await user.save()

        res.json({ success: true, updatedOrder , message: 'Order cancelled successfully, refund added to wallet'});
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ success: false, error: 'An error occurred' });
    }
};

   const verifyPayment = async (req, res) => {
    try{
        const id = req.session.user_id;
        const Data = req.body
        console.log(Data, 'razorpayyyy');
        const cartData = await cartModel.findOne({ user:id });
        
        const hmac = crypto.createHmac("sha256", "HV5q2AC1tNHwum1lC2CuL6GM" )
        hmac.update(Data.razorpay_id_ + "|" + Data.razorpay_payment_id);
        const hmacValue = hmac.digest("hex")
        if(hmacValue == Data.razorpay_signature){
            for( const Data of cartData.product){
                const { productId, quantity } = Data;
                await Product.updateOne({ _id: productId}, { $inc: {quantity: -quantity}})

            }
        }
        const newOrder = await orderModel.findByIdAndUpdate(
            { _id : Data.order.receipt},
            { $set : { orderStatus : "placed"}}
        )
        newOrder.products.forEach((product) =>{
            product.productStatus = "placed";
        })
        const orderItems = await orderModel.findByIdAndUpdate(
            { _id : newOrder._id},
            { $set: { products: newOrder.products}},
            { new:true}
        );
        for(const item of orderItems.products){
            await Product.updateOne(
                {_id:item.productId},
                {$inc:{quantity: -item.quantity}}
            )
        }
        const orderId = await newOrder._id

        await cartData.deleteOne({ user:id});
        console.log("iiid" + orderId);
        res.json({ orderId, success: true})
    } catch (error){
        console.log(error);
    }
   }

module.exports = {
    loadCheckout,
    checkoutPost,
    loadSuccess,
    orderDetails,
    cancelOrder,
    verifyPayment
}