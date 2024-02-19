const express = require('express')
const { log } = require('npmlog')
const adminRoute = express()
const admincontroller = require('../controllers/admincontroller') 
const auth = require('../middleware/auth')
const ejs = require('ejs')
const path = require('path')
const productController = require('../controllers/productcontroller')
const multer = require('../middleware/multer')



adminRoute.set("views","./views/admin")
  

adminRoute.get('/',admincontroller.adminlogin)
adminRoute.post('/',admincontroller.loadSignin)
adminRoute.get('/dashboard',auth.isAdminLogin,admincontroller.dashboard)
adminRoute.post('/blockusers/:id',admincontroller.blockUser)
adminRoute.post('/unblockusers/:id',admincontroller.unblockUser)
adminRoute.get('/users',auth.isAdminLogin,admincontroller.loadUser)
adminRoute.get('/category',auth.isAdminLogin,admincontroller.loadcategory)
adminRoute.get('/addcategory',admincontroller.addcategory)
adminRoute.post('/addcategory',admincontroller.categoryPost)
adminRoute.get('/product',auth.isAdminLogin,productController.loadProduct)
adminRoute.get('/addProducts',productController.loadAddProduct)
adminRoute.post('/addProducts',multer.uploadproduct,productController.addProductPost)
adminRoute.post('/listCategory/:id',admincontroller.listCategory)
adminRoute.post('/unlistCategory/:id',admincontroller.unlistCategory)
adminRoute.get('/editCategory',admincontroller.editCategory)
adminRoute.post('/editCategory',admincontroller.editCategoryPost) 
adminRoute.post('/unlistProduct/:id',productController.unlistProduct)
adminRoute.post('/listProduct/:id',productController.listProduct)
adminRoute.get('/editProduct',productController.editProduct)
adminRoute.post('/editProduct',multer.uploadproduct,productController.editProductPost)

module.exports = adminRoute;     

    





