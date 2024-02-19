const express = require('express');
const { log } = require('npmlog');
const User = require('../models/usermodel')
const UserOTPVerification = require('../models/userOtpmodel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const products = require('../models/productmodel')



//env variables
const dotenv = require('dotenv')
dotenv.config()

//route for home
const loadHome =  async (req, res) => {
    try {
        const user_id = req.session.user_id
        
        res.render('user/home',{user_id})
    } catch (error) {
        console.log(error);
    }
} 


//route for user login 

 const loadLogin =  async (req, res) => {
    try { console.log('aa');
        const loginmessage = req.query.loginmessage
        res.render('user/login',{loginmessage})
    } catch (error) {
        console.log(error);
        res.status(500).render('500')
    }
}
//route for user signup
const loadSignup =  async(req,res)=>{  
    try {
        res.render('user/signup')
    } catch (error) {
        console.log(error);
    }
}

const loadOtp = async (req, res) => {
    try {
        const id = req.query.id
        res.render('user/otp',{id})
    } catch (error) {
        console.log(error);
    }
}

 const loginPost =  async (req,res) =>{
    try{ console.log('rfrgf');    
        const email = req.body.email
        const password = req.body.password 
        // const data = JSON.parse(JSON.stringify(req?.body))
        console.log(password);
    
        const validUser = await User.findOne({email:email})
        if(validUser){
            const passwordMatch = await bcrypt.compare( password, validUser.password)
           
            if(passwordMatch){
                console.log(validUser.verified);
                if(validUser.verified === true){
                    console.log('gooett');
                    if(validUser.is_blocked == false){
                        console.log('rrrr');
                        req.session.user_id = validUser._id
                         res.redirect('/')
                    }else{
                      return res.json({block:true,message:'you have been blocked by admin'})
                    }
                } else{
                    const message = 'please verify your account with OTP'
                    await UserOTPverification(validUser,res,message)
                }

            }else {
                 res.render( 'user/login', {message:'incorrect password'})
            }
        }else {
            return res.render('user/login',{user : true, message:'you are not a user'})
        }
    } catch(error){
        console.log(error);
    }

}

//Nodemailer stuff
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: process.env.user_email,
        pass: process.env.user_password
    }
})
//testing success
transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log("ready for messages");  
        console.log("success");
    }
})

const signupPost =  async (req, res) => {

    try {
        let { name, email, number, password } = req.body;

        if (name === "" || email === "" || password === "") {
            res.render('user/signup', { message: 'the field is empty' });
        } else if (!/^[a-zA-Z]*$/.test(name)) {
            res.render('signup', {
                message: "Invalid name entered",
            });
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            res.render('signup', {

                message: "Invalid email entered",
            });
        } else {
            // Checking if user already exists
            const result = await User.findOne({ email });
            if (result) {
                // A user already exists
                res.render('login',{
                    status: "FAILED",
                    message: "User with the provided email already exists",
                });
            } else {
                // Try to create a new user

                // Password handling
                const saltRounds = 10;
                bcrypt
                    .hash(password, saltRounds)
                    .then(async (hashedPassword) => {
                        const newUser = new User({
                            name: name,
                            email : email,
                            number: number,
                            password: hashedPassword,
                            verified: false,
                        });
                        console.log("hioi"+""+newUser);
                        // Save the new user
                        const user = await newUser.save();
                        req.session.userId = user._id
                        await sendOTPVerificationEmail(user, res)

                    })

                    .catch((err) => {
                        console.log(err);
                        res.render('user/otp', {
                            message: "An error occurred while saving user account!",
                        });
                    });
            }
        }
    } catch (err) {
        console.log(err);
        res.render('user/otp',{
            status: "FAILED",
            message: "An error occurred while checking for an existing user",
        });
    }
};

//sendOTPVerificationEmail
const sendOTPVerificationEmail = async ({_id,email}, res) => {
    console.log(email, res)
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        console.log(otp);
        //mailOptions
        const mailOptions = {
            from: process.env.user_email,
            to: email,
            subject: "verify your email",
            html: `<p>Enter <b>${otp}</b>in the app to verify  your email address </p
            <p>This code <b>expires in 1 hour</b>.</p>`
        }

        // hash the otp 

        const saltRounds = 10


        const hashedOTP = await bcrypt.hash(otp, saltRounds)
        const newOTPVerification = new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60000

        })
        //save otp record
        await newOTPVerification.save()
        await transporter.sendMail(mailOptions)
        res.render('user/otp', {
            status: "PENDING",
            message: "verification otp mail sent",
            data: {

                email,
            },
        });
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message
        })
    }
}
//verify otp email 
const verifyOtpPost =  async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(userId);
        const userotp  = req.body.otp

        const UserOTPVerificationRecords = await UserOTPVerification.findOne({ userId : userId})
        console.log(UserOTPVerificationRecords,'recoord');

        if(!UserOTPVerificationRecords){
            return res.render('user/otp',{otp:false,message:"Account record doesn't exist or has been verified already. please signup or log in"})
        }
        const {expiresAt, otp} = UserOTPVerificationRecords

        if(expiresAt < Date.now()){
            await UserOTPVerification.deleteOne({user_id : userId})
            return res.render('user/otp',({otp : 'expired',message:"code has expired, please request again"}))
        } else{
            const validOTP = await bcrypt.compare(userotp,otp)
            if(!validOTP){
                console.log('invalid verifyy');
                res.render('user/otp',({otp : 'invalid',message:'invalid code,try again'}))
            }else{
                console.log('truee verifyy ');
                await User.updateOne({_id:userId},{$set:{verified:true}})
                await UserOTPVerification.deleteOne({userId:userId})
                res.redirect('/')
            } 
        }
        } catch(error){
            console.log(error);
            }
        }



   // resend otp 

     const resendOtpPost = async (req,res) =>{
        try{
            
            const id = req.session.userId;
            console.log(id,'qwertyui')
            const userdata = await User.findOne({_id:id})
            // resend otp verififcation email
            await sendOTPVerificationEmail(userdata,res);

        } catch(error){
            console.log(error);
            res.render('user/otp',{ otp:false, message:error.message})
        }
      }

      // resend otp 

      const rsendOTPVerificationEmail = async ({ _id, email }, res) => {
        try {
            // Generate a new OTP
            const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    
            // Mail options
            const mailOptions = {
                from: process.env.user_email,
                to: email,
                subject: "Resend: Verify your email",
                html: `<p>Enter <b>${otp}</b> in the app to verify your email address.</p>
                <p>This code <b>expires in 1 hour</b>.</p>`
            };
    
            // Hash the new OTP
            const saltRounds = 10;
            const hashedOTP = await bcrypt.hash(otp, saltRounds);
    
            // Update or create new OTP record
            const existingOTPVerification = await UserOTPVerification.findOne({ userId: _id });
            
            if (existingOTPVerification) {
                existingOTPVerification.otp = hashedOTP;
                existingOTPVerification.createdAt = Date.now();
                existingOTPVerification.expiresAt = Date.now() + 60000
                await existingOTPVerification.save();
            } else {
                const newOTPVerification = new UserOTPVerification({
                    userId: _id,
                    otp: hashedOTP,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + 60000
                });
    
                await newOTPVerification.save();
            }
    
            // Send the OTP verification email
            await transporter.sendMail(mailOptions);
    
            res.json({
                status: "PENDING",
                message: "Resent verification OTP mail sent",
                data: { email },
            });
        } catch (error) {
            console.log(error);
            res.json({
                status: "FAILED",
                message: error.message
            });
        }
    };
    


  //  go for shop 

 const loadShop =  async (req,res) =>{

    try{
        const productList = await products.find()
        res.render('user/shop',{productList})
       
       
    } catch(error){
        console.log(error);
    }
  }

  const loadSingleShop =  async (req,res)=>{

    try{ 
        const  id  = req.query.id;
         
        const productDetails = await products.findById({ _id:id })
       
        if(!productDetails){

            return res.status(404).send('product not found')
        }
       
        res.render('user/singleShop',{product:productDetails})
           
    }  catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
  }

 const singleShopPost =  async (req,res)=>{

    try{  
         const id = req.body.id
         console.log(id);
         const productDetails = await products.findById({_id:id})
         res.render('user/singleShop',{ product :productDetails})
    } catch(error){
        console.log(error);
    }
  }
 
  const loadProfile = async (req,res)=>{
    try{
        const user =  await User.findOne(req.session.user_id)
      
        res.render('user/profile',{user})
    }catch(error){
        console.log(error);
    }
  }
  

module.exports = {
     loadHome,
     loadLogin,
     loadOtp,
     loadShop,
     loadSignup,
     loadSingleShop,
     signupPost,
     singleShopPost,
     loginPost,
     verifyOtpPost,
     resendOtpPost,
     loadProfile
}





