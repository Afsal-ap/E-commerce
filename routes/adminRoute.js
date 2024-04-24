const express = require('express')
const { log } = require('npmlog')
const adminRoute = express()
const admincontroller = require('../controllers/admincontroller') 
const authAdmin = require('../middleware/authAdmin')
const ejs = require('ejs')
const path = require('path')
const productController = require('../controllers/productcontroller')
const multer = require('../middleware/multer')
const couponController = require('../controllers/couponController')
const offerController = require('../controllers/offerController')
const salesController = require('../controllers/salesController')

adminRoute.set("views","./views/admin")
  

adminRoute.get('/',authAdmin.isAdminLogout,admincontroller.adminlogin)
adminRoute.post('/',authAdmin.isAdminLogout,admincontroller.loadSignin)
adminRoute.get('/dashboard',authAdmin.isAdminLogin,admincontroller.dashboard)
adminRoute.post('/blockusers/:id',admincontroller.blockUser)
adminRoute.post('/unblockusers/:id',admincontroller.unblockUser)
adminRoute.get('/users',authAdmin.isAdminLogin,admincontroller.loadUser)
adminRoute.get('/category',authAdmin.isAdminLogin,admincontroller.loadcategory)
adminRoute.get('/addcategory',admincontroller.addcategory)
adminRoute.post('/addcategory',admincontroller.categoryPost)
adminRoute.get('/product',authAdmin.isAdminLogin,productController.loadProduct)
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
adminRoute.get('/orders',admincontroller.loadOrders)
adminRoute.get('/detailOrder',admincontroller.orderDetails)
adminRoute.post('/updateStatus',admincontroller.updateOrderstatus)
adminRoute.get('/coupon',couponController.loadCoupon)
adminRoute.get('/addCoupon',couponController.addCoupon)
adminRoute.post('/addCoupon',couponController.addCouponPost)
adminRoute.post('/deleteCoupon',couponController.deleteCoupon)
adminRoute.get('/offer',offerController.loadOffer)
adminRoute.get('/addoffer',offerController.addOffer)
adminRoute.post('/addOffer',offerController.addOfferPost)
adminRoute.post('/deleteOffer',offerController.deleteOffer)
adminRoute.post('/applyOffer',offerController.applyOffer)
adminRoute.post('/removeOffer',offerController.removeOffer)
adminRoute.post('/applyCategoryOffer',offerController.applyCategoryOffer)
adminRoute.post('/removeCategoryOffer',offerController.removeCategoryOffer)
adminRoute.get('/Sales',salesController.getSales)
adminRoute.get('/pdf',salesController.generatePdf)
adminRoute.get('/excelReport',salesController.excelReport)

module.exports = adminRoute;     

    





