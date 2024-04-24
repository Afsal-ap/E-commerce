const CouponModel = require('../models/couponModel')
const cartModel = require('../models/cartModel')



const loadCoupon = async (req,res) => { 
          

    try{
      const page = parseInt(req.query.page) || 1;
      const pageSize = 3;
      const totalCoupons = await CouponModel.countDocuments();
      const totalPages = Math.ceil(totalCoupons / pageSize);
      const  coupons =await CouponModel.find({})
          .skip((page - 1) * pageSize)
          .limit(pageSize);
      
        res.render('coupon',{coupons , totalPages , currentPage : page})
    } catch(error){
      console.log(error);
    }
 }


 const addCoupon = async (req,res) =>{
   

  try{
      res.render('addCoupon')
  } catch(error){
      console.log(error);
  }
 }

 const addCouponPost = async (req,res) => {

  try{
       couponData = await CouponModel.findOne({ couponCode: req.body.code})

      if(couponData){
        res.render("addCoupon",{message :'coupon code already exist'})
      }else{
        const activationDate = new Date(req.body.actDate);
        const expiryDate = new Date(req.body.exDate);
         
        const data = new CouponModel({
            name : req.body.name,
            couponCode:req.body.code,
            discountAmount:req.body.disAmount,
            activationDate:activationDate,
            expiryDate:expiryDate,
            criteriaAmount:req.body.criteriaAmount,
           
        
        })
        console.log(data, 'data');
        await data.save()
        res.redirect('/admin/coupon')
      }

  }catch(error){
    console.log(error.message);
  }
 }

 const deleteCoupon = async (req,res) =>{

      try{
          const id = req.body.couponId
         const  deleted = await CouponModel.deleteOne({_id:id})
           
         console.log(id,"idid");

         res.json({success:true})

      } catch(error){
        console.log(error);
      }
 }

 const applyCoupon = async (req,res) => {
     
  try{
        const  user = req.session.user_id
        const couponId = req.body.couponId
        const currentDate =  new Date()
        
        const  selectedCoupon =  await CouponModel.findOne({ _id :couponId , expiryDate :{ $gte : currentDate }, is_blocked : false });
          console.log(selectedCoupon );
         
        const exist = selectedCoupon.usedUsers.includes(user)
        
        if(!exist){
          const existingCart  = await cartModel.findOne({ user : user })
         
          if(existingCart && existingCart.couponDiscount === null){
            await CouponModel.findOneAndUpdate({ _id : couponId}, { $push :{ usedUsers : user}})
            await cartModel.findOneAndUpdate({ user : user} , { $set : { couponDiscount : selectedCoupon._id}})
            res.json({ coupon : true })
          }else{
            res.json({ coupon : "Already applied"})
          }
        }else{
           res.json({ coupon : "Already used"})
        }

  }catch(error){
    console.log(error); 
  }
 }


 const removeCoupon = async (req,res)=> {
      try{
        const couponId = req.body.id
        const userId = req.session.user_id
        const cartData = await cartModel.findOne({user:userId})
        const couponData = await CouponModel.findOneAndUpdate({_id:couponId}, {$pull:{ usedUsers:userId }})
        const updateCart = await cartModel.findOneAndUpdate({ user: userId},{ $set:{ couponDiscount: null}})
        res.json({ success :true})
      }catch(error){
        console.error(error.message)
      }
 }
 
 module.exports = {
     loadCoupon,
     addCoupon,
     addCouponPost,
     deleteCoupon,
     applyCoupon,
     removeCoupon
 }
