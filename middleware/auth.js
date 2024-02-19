
   const express = require('express')
   const session = require('express-session')
   // user middleware

const isLogin = (req,res,next) =>{
    try{
        console.log("Executing isLogin middleware");

        if (req.session.user_id){

        //the user is logged , continue to the next middleware or route handler
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
       // user is  logged  , redirect to the homepage or another appropriate route     
      console.log("middleware:" + req.session.user_id);    
    res.redirect('/')
    }else{
     //user is not logged in , continue to the nextt midddleware
     next()
    }
    } catch(error){
        console.log(error);
    }
}

//admin middleware


const isAdminLogin = async (req,res,next)=>{
    try{
     if (req.session.admin_id){
        next()
     }else{
        res.redirect('/admin')
        
     }
     } catch(error){
        console.log(error);
     }
    }
const isAdminLogout = async (req,res,next) =>{
    try{
        if(req.session.admin_id){
            res.redirect('/admin/adminhome')
        } else{
            next()
        }
    }  catch (error){
        console.log(error);
    }
}

module.exports = {
    isLogin,
    isAdminLogin,
    isAdminLogout,
    isLogout
}