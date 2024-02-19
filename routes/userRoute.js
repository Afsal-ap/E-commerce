const express = require('express')
const userRoute = express();
const usercontroller = require('../controllers/usercontroller')
const auth = require('../middleware/auth')


userRoute.set('view engine','ejs')


userRoute.get('/',auth.isLogin,usercontroller.loadHome)
userRoute.get('/login',usercontroller.loadLogin)
userRoute.get('/signup',usercontroller.loadSignup)
userRoute.get('/otp',usercontroller.loadOtp)
userRoute.post('/verifyOtp',usercontroller.verifyOtpPost)
userRoute.post('/resendOtp',usercontroller.verifyOtpPost)
userRoute.post('/login',usercontroller.loginPost)
userRoute.post('/signup',usercontroller.signupPost)
userRoute.get('/shop',usercontroller.loadShop)
userRoute.get('/singleShop',usercontroller.loadSingleShop)
userRoute.post('/singleShop',usercontroller.singleShopPost)  
userRoute.get('/profile',usercontroller.loadProfile)
userRoute.get('/editProfile',usercontroller.editProfile)

module.exports = userRoute;     
