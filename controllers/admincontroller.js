

const bcrypt = require('bcrypt')
const User = require('../models/usermodel')
const categoryModel = require('../models/categorymodel')
const path = require('path')
const { log } = require('console')
const orderModel = require('../models/orderModel')
const offerModel = require('../models/offerModel')
const productModel = require('../models/productmodel')
const mongoose = require('mongoose')

const adminlogin = async (req, res) => {
    try {

        res.render('adminlogin')

    } catch (error) {
        console.log(error);
    }
}

const dashboard = async (req, res) => {
    try {

        const revenue = await orderModel.aggregate([
            {
                $match: { orderStatus: { $in: ['placed', 'delivered'] } }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$subtotal' }
                }
            }
        ])

      
        const totalOrders = await orderModel.countDocuments({orderStatus : 'delivered'})
        const totalProducts = await productModel.countDocuments()
        
        
        
        const overallDiscount = await orderModel.aggregate([
            {
                $match: { orderStatus: { $in: ['placed', 'delivered'] } }
            },
            {
                $group: {
                    _id: null,
                    totalDiscount: { $sum: '$discountAmount' }
                }
            }
        ])
        
        let labels;
        let salesArray;
        
        const filterValue = req.query.filter;
        console.log(filterValue, "filter");
        
        if (filterValue === 'monthly') {
            const currentYear = new Date().getFullYear();
            labels = [1,2,3,4,5,6,7,8,9,10,11,12];
        
            const monthlySalesData = [];
        
            for (let i = 0; i < labels.length; i++) {
                const startMonth = new Date(currentYear, i, 1);
                const endMonth = new Date(currentYear, i + 1, 1);
                endMonth.setMilliseconds(endMonth.getMilliseconds() - 1);
        
                const monthlySale = await orderModel.aggregate([
                    {
                        $match: {
                            orderStatus: 'delivered',
                            orederDate: {
                                $gte: startMonth,
                                $lt: endMonth
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSales: { $sum: '$subtotal' }
                        }
                    }
                ]);
        
                const totalSales = monthlySale.length > 0 ? monthlySale[0].totalSales : 0;
                monthlySalesData.push(totalSales);
            }
        
            salesArray = monthlySalesData;
        } else {
            const currentYear = new Date().getFullYear();
            const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
            labels = years;
        
            const yearlySales = [];
        
            for (const year of years) {
                const startYear = new Date(year, 0, 1);
                const endYear = new Date(year + 1, 0, 1);
                endYear.setMilliseconds(endYear.getMilliseconds() - 1);
        
                const yearlySale = await orderModel.aggregate([
                    {
                        $match: {
                            orderStatus: 'delivered',
                            orederDate: {
                                $gte: startYear,
                                $lt: endYear
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { $year: '$orederDate' }, // Group by year
                            yearlySale: { $sum: '$subtotal' } // Calculate total sales
                        }
                    }
                ]);
        
                yearlySales.push({ year, yearlySale });
            }
        
            salesArray = Array(5).fill(0);
        
            yearlySales.forEach((yearSale, index) => {
                salesArray[index] = yearSale.yearlySale.length > 0 ? yearSale.yearlySale[0].yearlySale : 0;
            });
        }
        
        const topSellingProducts = await orderModel.aggregate([
            { $match: { orderStatus: 'delivered' } },
            { $unwind: "$products" },
            {
              $lookup: {
                from: "products",
                localField: "products.productId",
                foreignField: "_id",
                as: "joinedProduct"
              }
            },
            { $unwind: "$joinedProduct" },
            {
              $group: {
                _id: "$joinedProduct._id",
                productName: { $first: "$joinedProduct.name" },
                totalSold: { $sum: "$products.quantity" },
              }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 3 },
          ]);
          
          const topProductLabels = topSellingProducts.map(product => product.productName);
          const topProductCounts = topSellingProducts.map(product => product.totalSold);
         
          const topSellingCategories = await orderModel.aggregate([
            { $match: { orderStatus: 'delivered' } }, // Match only delivered orders
            { $unwind: '$products' }, // Unwind the products array
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'joinedProduct',
                },
            },
            { $unwind: '$joinedProduct' }, 
            {
                $group: {
                    _id: '$joinedProduct.categoryId', 
                    totalQuantity: { $sum: '$products.quantity' }, 
                },
            },
            { $sort: { totalQuantity: -1 } }, 
            { $limit: 3 }, 
        ]);
        
        const topCategoryLabels = topSellingCategories.map(category => category._id);
        const topCategoryCounts = topSellingCategories.map(category => category.totalQuantity);
        
        const topCategoryNames = await categoryModel.find({ _id: { $in: topCategoryLabels } },{ _id : 0 , name : 1})
        .select('name');
        const topCategoryNamesArray = topCategoryNames.map(category => category.name);
       
        
        res.render('dashboard', { revenue, totalOrders, totalProducts, overallDiscount, salesArray ,
            topProductLabels,  topProductCounts,topCategoryLabels ,topCategoryCounts , topCategoryNames,
            topCategoryNames: topCategoryNamesArray,labels})

    } catch (error) {
        console.log(error);
    }
}

// check admin is  valid

const loadSignin = async (req, res) => {
    try {

        const email = req.body.email
        const password = req.body.password

        const validAdmin = await User.findOne({ email: email })
        if (validAdmin && validAdmin.isAdmin == 1) {
            const passwordMatch = await bcrypt.compare(password, validAdmin.password)

            if (passwordMatch) {

                req.session.admin_id = validAdmin._id
                res.redirect("/admin/dashboard")
            } else {
                res.render("adminlogin", { message: "incorrect password" })
            }
        } else {
            res.render("adminlogin", { message: "you are not an admin" })
        }
    } catch (error) {
        console.log(error);
    }
}

const loadUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / pageSize);

        const users = await User.find({})
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        res.render('users', { users, totalPages, currentPage: page });

    } catch (error) {
        console.log(error);
    }
}

// block user 

const blockUser = async (req, res) => {
    try {

        console.log("hello");
        const { id } = req.params;
        console.log(id);

        const user = await User.findOne({ _id: id });
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
        const user = await User.findOne({ _id: id });
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

const loadcategory = async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 4;
        const totalCategory = await categoryModel.countDocuments();
        const totalPages = Math.ceil(totalCategory / pageSize);
        const category = await categoryModel.find().populate('offer').limit(5)
        
        .skip((page - 1) * pageSize)
        .limit(pageSize);

        const offers = await offerModel.find()

        const message = req.query.message

        res.render('category', { category, message, offers , totalPages , currentPage : page})
    } catch (error) {
        console.log(error);
    }
}

// load  add category 

const addcategory = async (req, res) => {
    try {
        res.render('addcategory')
    } catch (error) {
        console.log(error);
    }
}


// add category post 

const categoryPost = async (req, res) => {
    try {

        const name = req.body.name.trim().toLowerCase()
        const description = req.body.description.trim()
        const validData = await categoryModel.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })

        if (validData) {
            res.render('addcategory', { message: 'this category already exists' })
        } else {
            const newUser = new categoryModel({
                name: name,
                description: description,
                is_blocked: false
            })
            await newUser.save()
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('500')
    }
}
//list category 

const listCategory = async (req, res) => {
    try {

        console.log("hello");
        const { id } = req.params;

        //Find the user by ID
        const category = await categoryModel.findOne({ _id: id });

        if (!category) {
            return res.status(404).json({ error: ' not found' });
        }
        category.is_blocked = !category.is_blocked;
        await category.save();

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
        const category = await categoryModel.findOne({ _id: id });

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


const editCategory = async (req, res) => {
    try {

        const id = req.query.id;
        const category = await categoryModel.findById({ _id: id });
     
        if (category) {
            res.render('editCategory', { category });
        }



    } catch (error) {
        console.error(error);

    }
}


// edit category post

const editCategoryPost = async (req, res) => {


    try {
        const id = req.query.id;
        const { name, description } = req.body;

        let category = await categoryModel.findById({ _id: id });

        const validData = await categoryModel.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });

        if (validData) {
            return res.render('editCategory', { message: 'This category already exists', category });
        }

        if (!category) {
            return res.status(404).render('404');
        }

        category.name = name;
        category.description = description;

        await category.save();

        res.redirect('/admin/category');
    } catch (error) {
        console.error(error);

        res.status(500).render('500');
    }
};

// load order 

const loadOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 3;
        const totalOrders = await orderModel.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);
        const orderData = await orderModel.find({ orderStatus: { $ne: 'pending' } })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        res.render('orders', { orderData, totalPages, currentPage: page })
    } catch (error) {
        console.log(error);
    }
}


// ordr details  


const orderDetails = async (req, res) => {

    const orderid = req.query.id;
    console.log("oii", orderid);
    try {
        const order = await orderModel.findById(orderid).populate('products.productId').populate('user.req.session.user_id')

        res.render('detailOrder', { order })
    } catch (error) {
        console.log(error);
    }
}

const updateOrderstatus = async (req, res) => {
    const orderId = req.body.orderId;
    const newStatus = req.body.status;
    console.log(newStatus);
    try {
        // Find and update the order status
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { orderStatus: newStatus }, { new: true });

        if (updatedOrder) {
            res.json({ success: true, message: 'Order status updated successfully.' });
        } else {
            res.status(404).json({ success: false, message: 'Order not found.' });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
}



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
    editCategoryPost,
    loadOrders,
    orderDetails,
    updateOrderstatus

}
