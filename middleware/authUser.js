
// const session = require('express-session')


 const User = require('../models/usermodel')

 
const isLogin = (req,res,next) =>{
    try{
        
        console.log("Executing isLogin middleware");

        if (req.session.user_id){
    
        
            next()
        }else{
            res.redirect('/login')
        }
    }
    
    catch (error){
        console.log(error);
    }
}
const isLogout = (req,res,next) =>{
    try{
        if(req.session.user_id){
         
      console.log("middleware:" + req.session.user_id);    
    res.redirect('/')
    }else{
     
     next()
    }
    } catch(error){
        console.log(error);
    }
}


 // blocking middleware 


 const isBlocked = async (req, res, next) => {
    try {
        const userId = req.session.user_id;

        
        const user = await User.findById(userId);

        if (user && user.is_blocked) {
            return res.send('You are blocked. Please contact support.');
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
};


module.exports = {

    isLogin,
    isLogout,
    isBlocked
}