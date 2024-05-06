
const { log } = require('npmlog');
const User = require('../models/usermodel')
const UserOTPVerification = require('../models/userOtpmodel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const products = require('../models/productmodel')
const addressModel = require('../models/addressModel')
const orderModel = require('../models/orderModel')
const categoryModel = require('../models/categorymodel')
const offerModel = require('../models/offerModel')
const wishlistModel = require('../models/wishlistModel')
const puppeteer = require('puppeteer')
const ejs = require('ejs')

//env variables
const dotenv = require('dotenv')
dotenv.config()

//route for home
const loadHome = async (req, res) => {
    try {
        const user_id = req.session.user_id

        res.render('user/home', { user_id })
    } catch (error) {
        console.log(error);
    }
}


//route for user login 

const loadLogin = async (req, res) => {
    try {
        console.log('aa');
        const loginmessage = req.query.loginmessage
        res.render('user/login', { loginmessage })
    } catch (error) {
        console.log(error);
        res.status(500).render('500')
    }
}
//route for user signup
const loadSignup = async (req, res) => {
    try {
        res.render('user/signup')
    } catch (error) {
        console.log(error);
    }
}

const loadOtp = async (req, res) => {
    try {
        const id = req.query.id
        res.render('user/otp', { id })
    } catch (error) {
        console.log(error);
    }
}

const loginPost = async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password
        // const data = JSON.parse(JSON.stringify(req?.body))
        console.log(password);

        const validUser = await User.findOne({ email: email })
        if (validUser) {
            const passwordMatch = await bcrypt.compare(password, validUser.password)

            if (passwordMatch) {
                console.log(validUser.verified);
                if (validUser.verified === true) {
                    if (validUser.is_blocked == false) {
                        req.session.user_id = validUser._id
                        res.redirect('/')
                    } else {
                        res.render('user/login', { block: true, message: 'you have been blocked by admin' })
                    }
                } else {
                    const message = 'please verify your account with OTP'
                    await UserOTPverification(validUser, res, message)
                }

            } else {
                res.render('user/login', { message: 'incorrect password' })
            }
        } else {
            return res.render('user/login', { user: true, message: 'you are not a user' })
        }
    } catch (error) {
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

const signupPost = async (req, res) => {

    try {
        let { name, email, number, password , code} = req.body;
          let data;
          if(code){
            const referalCheck = await User.find({referralCode:code})
            if(referalCheck.length === 0 ){
                res.json({ referal :false  , message :" Invalid code entered"})
            
          }else{
             data = {
             amount :1000,
             date : new Date()
          }
        }
    }

        if (name === "" || email === "" || password === "") {
            res.render('user/signup', { message: 'the field is empty' });
        } else if (!/^[a-zA-Z]*$/.test(name)) {
            res.render('signup', {
                message: "Invalid name entered",
            });
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            res.render('signup',{

                message: "Invalid email entered",
            });
        } else {
            // Checking if user already exists
            const result = await User.findOne({ email });
            if (result) {
                // A user already exists
                res.render('login', {
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
                            email: email,
                            number: number,
                            password: hashedPassword,  
                            verified: false,
                            referralCode : await generateCode()
                        });
                        console.log("hioi" + "" + newUser);
                        
                        // Save the new user
                        const user = await newUser.save();

                        if (data && user){
                         const userData =    await User.findByIdAndUpdate(user._id, { $push:{ walletHistory : data },
                             $inc : { wallet : 1000} },{ new : true})
                        }
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
        res.render('user/otp', {
            status: "FAILED",
            message: "An error occurred while checking for an existing user",
        });
    }
};

//sendOTPVerificationEmail
const sendOTPVerificationEmail = async ({ _id, email }, res) => {
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
   const verifyOtpPost = async (req, res) => {
    try {
        const userId = req.session.userId;
       
        const userotp = req.body.otpValue
         console.log(userotp,"userotp");
        const UserOTPVerificationRecords = await UserOTPVerification.findOne({ userId: userId })
        console.log(UserOTPVerificationRecords, 'recoord');

        if (!UserOTPVerificationRecords) {
             res.json( { otp: false, message: "Account record doesn't exist or has been verified already. please signup or log in" })
        }
        const { expiresAt, otp } = UserOTPVerificationRecords

        if (expiresAt < Date.now()) {
            await UserOTPVerification.deleteOne({ user_id: userId })
            res.json ({ otp: 'expired', message: "code has expired, please request again" })
        } else {
            const validOTP = await bcrypt.compare(userotp, otp)
            if (!validOTP) {
                console.log('invalid verifyy');
                res.json ({ otp: 'invalid', message: 'invalid code,try again' })
            } else {
                console.log('truee verifyy ');
                await User.updateOne({ _id: userId }, { $set: { verified: true } })
                await UserOTPVerification.deleteOne({ userId: userId })
                res.json({otp :true})
            }
        }
    } catch (error) {
        console.log(error);
    }
}



// resend otp 

const resendOtpPost = async (req, res) => {
    try {

        const id = req.session.userId;
        console.log(id, 'qwertyui')
        const userdata = await User.findOne({ _id: id })
        // resend otp verififcation email
        await sendOTPVerificationEmail(userdata, res);

    } catch (error) {
        console.log(error);
        res.render('user/otp', { otp: false, message: error.message })
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

 function generateCode(){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
     let code = '';
     for( let i = 0; i < 6; i++){
        const randomIndex = Math.floor(Math.random()* characters.length)
        code += characters.charAt(randomIndex)
     }
     return code;
 }



//  go for shop 

const loadShop = async (req, res) => {

    const ITEMS_PER_PAGE = 9
    try {
        const categories = await categoryModel.find()
        let sort = req.query.sort
        let page = parseInt(req.query.page) || 1;
        const offer = await offerModel.find() 
        var productList 
        if (req.query.search) {
            const searchQuery = req.query.search
             
            productList = await products.find({ name: { $regex: new RegExp(searchQuery, 'i') } })
            .populate('categoryId')
        } else if (req.query.category) {

            const selectedCategory = req.query.category;
            productList = await products.find({ categoryId: selectedCategory });
        } else {
            // Load all products
            productList = await products.find().populate('categoryId').populate('offer')
            
        }

        /////// sortinggg

        switch (sort) {
            case 'high-to-low':
                productList = productList.slice().sort((a, b) => b.price - a.price);
                break;
            case 'low-to-high':
                productList = productList.slice().sort((a, b) => a.price - b.price);
                break;
            default:
                productList = productList
                break;
        }

        // Pagination 

        const totalItems = productList.length;
        const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        const paginatedProductList = productList.slice(startIndex, endIndex);



        res.render('user/shop', { productList: paginatedProductList, categories, sort, currentPage: page, totalPages, offer })

    } catch (error) {
        console.log(error);
    }
}

const loadSingleShop = async (req, res) => {

    try {
        const id = req.query.id;

        const productDetails = await products.findById({ _id: id })

        if (!productDetails) {

            return res.status(404).send('product not found')
        }

        res.render('user/singleShop', { product: productDetails })

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

const singleShopPost = async (req, res) => {

    try {
        const id = req.body.id
        console.log(id);
        const productDetails = await products.findById({ _id: id })
        res.render('user/singleShop', { product: productDetails })


    } catch (error) {
        console.log(error);
    }
}

const loadProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id)
        const userAddress = await addressModel.findOne({ user: req.session.user_id })
        const orders = await orderModel.find({ user: req.session.user_id })
        
        
        if (user) {
            const page = parseInt(req.query.page) || 1;
            const pageSize = 2; 
        
            const totalWalletHistory = user.walletHistory.length;
            const totalPages = Math.ceil(totalWalletHistory / pageSize);
        
            const walletHistory = user.walletHistory.slice((page - 1) * pageSize, page * pageSize);
                  // order pagination 
            const orderPage = parseInt(req.query.orderPage) || 1;
            const orderPageSize = 6
            const totalOrderHistory = orders.length;
            const totalOrderPage = Math.ceil(totalOrderHistory / orderPageSize);
            const orderList = orders.slice((orderPage - 1) *  orderPageSize , orderPage * orderPageSize )
            res.render('user/profile', { user, userAddress, orderList, totalPages , currentPage : page , walletHistory,
               orderCurrentPage : orderPage, totalOrderPage  })
            
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.log(error);   
    }
}

const editProfile = async (req, res) => {
    try {
        const userData = req.body;
        if (!userData) {
            return res.status(404).send("User not found");
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: userData.email },
            { $set: { name: userData.name, number: userData.number } },
            { new: true }
        );

        if (!updatedUser) {

            return res.status(500).send("Failed to update user profile");
        }


        res.redirect('/profile');
    } catch (error) {
        console.error(error);

        res.status(500).send("Internal server error");
    }
};



const addAddress = async (req, res) => {
    try {
        const formData = req.body;
        const userId = req.session.user_id;

        const newAddress = {

            name: formData.adName,
            address: formData.address,
            landmark: formData.landmark,
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            phone: formData.phone,
            email: formData.adEmail,
        };

        const newADD = await addressModel.updateOne(
            { user: userId },
            { $push: { address: newAddress } },
            { upsert: true, new: true }
        )


        // Redirect or send a response
        res.redirect('/profile');
    } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).send('Internal Server Error');
    }
};


// edit user Address  

const editAddress = async (req, res) => {

    try {
        const { id, adName, address, landmark, state, city, pincode, phone, adEmail } = req.body;
        console.log(req.body, 'under');




        const user = await addressModel.findOne({ 'address._id': id });


        if (!user) {
            return res.status(404).json({ error: 'Address not found' });
        }
        console.log(user, 'loooo');




        const updateToAddress = user.address.id(id)
        console.log(updateToAddress, 'updatesss');




            updateToAddress.name = adName,
            updateToAddress.address = address,
            updateToAddress.landmark = landmark
            updateToAddress.state = state,
            updateToAddress.city = city,
            updateToAddress.pincode = pincode,
            updateToAddress.phone = phone,
            updateToAddress.email = adEmail,


            await user.save()
        res.redirect('/profile')

        res.json({ success: true })



    } catch (error) {
        console.error(error);


    }
};


// User logout 

const logout = (req, res) => {
    try {

        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                res.status(500).send("Internal Server Error");
            } else {

                res.json({ message: "Logout successful" });
            }
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).send("Internal Server Error");
    }
};



// change password 


const changePassword = async (req, res) => {
    try {
        const { oldPass, newPass, confirm } = req.body;
        const userId = req.session.user_id;
        console.log(req.body, 'bngg');
        const user = await User.findById({ user :userId});
        console.log(user, 'userrr');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordMatch = await bcrypt.compare(oldPass, user.password);

        if (!isPasswordMatch) {
            return res.status(400).json({ error: 'Invalid old password' });
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPass, saltRounds);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id
        const wishlistData = await wishlistModel.findOne({ userId : userId}).populate('products.productId')
        res.render('user/wishlist',{wishlistData})
    } catch (error) {
        console.log(error.message);
    }
}

const addWishlist = async (req, res) => {
    try {
        if(req.session.user_id){
        const productId = req.body.productId;
        const userId = req.session.user_id;
        const wishlistProducts = await wishlistModel.findOne({ userId : userId , 'products.productId': productId })

        if (wishlistProducts) {
            await wishlistModel.findOneAndUpdate({
                userId : userId , 'products.productId': productId },
              {  $pull : { 'products':  {'productId' : productId }}})
              res.json({ success:true , productId: productId , message : 'Product removed successfully'});
               console.log("removed");
            }else{
                const data = {
                    productId : productId,
                }
                await wishlistModel.findOneAndUpdate({
                    userId : userId },
                     { $push : { products :data }},
                     { upsert : true , new : true }
                )
                console.log('true');
                res.status(200).json({ success: true, message: 'Product added to wishlist' });
            }

       
    }else{
        res.json({success:false})
    }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'An error occurred' });

    }
}

const removeWishlist  = async(req,res) =>{
    try{
        
            const productId = req.body.productId;
            const userId = req.session.user_id;
              console.log('proid', productId , 'user ', userId);
            const wishlistProducts = await wishlistModel.findOneAndUpdate({ userId: userId}, { $pull:{'products':{'productId': productId}} },{new:true});
                     console.log(wishlistProducts,"remo");
            if (wishlistProducts) {
              
                res.json({ success: true });
            } else {
                console.log('Product not found in wishlist');
                res.json({ success: false, message: 'Product not found in wishlist' });
            }
         
    } catch (error) {
        console.log(error);
    }
}

const getInvoice = async (req ,res) => {
    try{

       const orderid = req.params.orderId
       console.log(orderid);
       const order = await orderModel.findById(orderid).populate('products.productId')
       
       console.log(order , "ordereeyyyy");

        const htmlContent = await ejs.renderFile('./views/user/invoice.ejs', {order });
       
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf.ejs');
        res.send(pdfBuffer);
         
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
    loadProfile,
    editProfile,
    addAddress,
    editAddress,
    logout,
    changePassword,
    loadWishlist,
    addWishlist,
    removeWishlist,
    getInvoice
}





