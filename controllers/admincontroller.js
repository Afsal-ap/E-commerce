
const express = require('express')
const adminRoute = express()
const bcrypt = require('bcrypt')
const User = require('../models/usermodel')
const categoryModel = require('../models/categorymodel')
const path = require('path')
const { log } = require('console')



const adminlogin = async(req,res)=>{
    try{
        
        res.render('adminlogin')
        
    }catch(error){
        console.log(error);
    }
}

const dashboard = async(req,res)=>{
    try {
        res.render('dashboard')
        
    } catch(error){
         console.log(error);
    }
}

// check admin is  valid

const loadSignin = async (req,res) => {
    try {
        
        const email = req.body.email
        const password = req.body.password
        
        const validAdmin = await User.findOne({email : email})
        if(validAdmin && validAdmin.isAdmin == 1){
            const passwordMatch = await bcrypt.compare(password, validAdmin.password)
          
           if (passwordMatch){
            
            req.session.admin_id = validAdmin._id
            res.redirect("/admin/dashboard")
        }else{
            res.render("adminlogin",{message:"incorrect password"})
        }
    } else{
        res.render("adminlogin",{message:"you are not an admin"})
    }
} catch (error){
    console.log(error);
}
}

const loadUser = async (req,res)=>{
    try{
        const userData = await User.find({})
        res.render('users',{users:userData})
    } catch(error){
        console.log(error);
    }
}

   // block user 

const blockUser = async (req,res) => {
    try{     

         console.log("hello");
            const { id } = req.params;
         console.log(id);
            
            const user = await User.findOne({_id:id});
            if (!user) {
              return res.status(404).json({ error: 'User not found' });
            }
        
           
            user.is_blocked = !user.is_blocked;
            await user.save();
        
          
        
            res.json({ block: true });   
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
}

    // unblock user

     const unblockUser = async (req, res) => {
    try { 
         console.log("hhi");
      const { id } = req.params;
  
      // Find the user by ID
      const user = await User.findOne({_id:id});
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
     
       user.is_blocked = false;
      await user.save();
  
    
  
      res.json({ unblock: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
    // load category 

     const loadcategory = async (req,res)=>{

        try{
            const message = req.query.message
            const category = await categoryModel.find({})
            res.render('category',{category,message})

        }catch(error){
         console.log(error);
        }
     } 

   // load  add category 
    
   const addcategory = async (req,res)=>{
    try{  
        res.render('addcategory')
    } catch(error){
        console.log(error);
    }
   }


  // add category post 

   const categoryPost = async (req,res) =>{
    try{
       
        const name = req.body.name.trim()
        const description = req.body.description.trim()
        const validData = await categoryModel.findOne({name:name})
       
     if (validData){
        res.render('addcategory',{ message :'this category already exists'})
        } else{
            const newUser = new categoryModel({
                name:name,
                description:description,
                is_blocked : false
            })
            await newUser.save()
            res.redirect('/admin/category')
        }
    } catch(error){
        console.log(error.message);
        res.status(500).render('500')
    }
   }
  //list category 

  const listCategory = async (req,res) => {
    try{     

         console.log("hello");
            const { id } = req.params;
        
            // Find the user by ID
            const category = await categoryModel.findOne({_id:id});
            if (!category) {
              return res.status(404).json({ error: ' not found' });
            }
        
            // Toggle the block status
            category.is_blocked = !category.is_blocked;
            await category.save();
        
            // Optionally, you can handle any additional logic here
        
            res.json({ list: true });   
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
}
   
 // unlist category 

 const unlistCategory = async (req, res) => {
    try { 
         console.log("hhi");
      const { id } = req.params;
  
      // Find the user by ID
      const category = await categoryModel.findOne({_id:id});
      if (!category) {
        return res.status(404).json({ error: ' not found' });
      }
  
      // Toggle the block status
       category.is_blocked = false;
      await category.save();
  
    
  
      res.json({ unlist: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

       // edit category


  const editCategory = async (req,res) => {
    try{
        
        const  id  = req.query.id;
        const category = await categoryModel.findById({ _id:id});

        if (category) {
            res.render('editCategory', {category}); 
        }

        

    }catch (error) {
        console.error(error);
       
  } 
}


  // edit category post

  const editCategoryPost = async (req,res) => {
    
        try {
            const  id  = req.query.id
            const { name, description } = req.body;
    
            const category = await categoryModel.findById({ _id: id });
    
            if (!category) {
                return res.status(404).render('404'); 
            }
    
           
            category.name = name;
            category.description = description;
    
            await category.save();
    
            res.redirect('/admin/category'); 
        } catch (error) {
            console.error(error);
             
        }
    };
  

 module.exports = {
    dashboard,
    adminlogin,
    loadSignin,
    loadUser,
    blockUser,
    unblockUser,
    loadcategory,
    addcategory,
    categoryPost,
    listCategory,
    unlistCategory,
    editCategory,
    editCategoryPost
}
