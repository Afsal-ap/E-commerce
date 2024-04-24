const orderModel = require('../models/orderModel')
const puppeteer = require('puppeteer')
const ejs = require('ejs')
const excel = require('exceljs')
const productmodel = require('../models/productmodel')

const getSales = async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const pageSize = 4;
        const totalOrders = await orderModel.countDocuments({orderStatus : 'delivered'})
        const totalPages = Math.ceil(totalOrders / pageSize);
      
       
        const customStart = req.query.startDate;
        const customEnd = req.query.endDate;
        const report = req.query.reportType;
        const currentDate = new Date();

        let startDate, endDate, query;

        if (customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
        } else {
            switch (report) {
                case 'Daily':
                    startDate = new Date(currentDate);
                    endDate = new Date(currentDate);
                    break;
                case 'Weekly':
                    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay());
                    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (6 - currentDate.getDay()));
                    break;
                case 'Monthly':
                    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                    break;
                case 'Yearly':
                    startDate = new Date(currentDate.getFullYear(), 0, 1);
                    endDate = new Date(currentDate.getFullYear(), 11, 31);
                    break;
                default:
                    startDate = null;
                    endDate = null;
                    break;
            }
        }

        if (startDate && endDate) {
            query = { orederDate: { $gte: startDate, $lte: endDate } };
        } else {
            query = {}; 
        }

        const orders = await orderModel.find({ $and : [ query , {orderStatus : 'delivered'}]})
        .populate('user').populate('products.productId')
        .skip((page - 1) * pageSize)
        .limit(pageSize);

         
        let totalSales = 0;
        let totalDiscounts = 0;
        let totalCoupons = 0;

        orders.forEach((order) => {
            order.products.forEach((product) => {
                totalSales += product.price;
                totalDiscounts += product.discountAmount || 0;
                totalCoupons += product.couponDiscount || 0;
            });
        });

        const salesReport = {
            orders,
            totalSales,
            totalDiscounts,
            totalCoupons,
        };

       
        res.render('Sales', {  salesReport , totalPages , currentPage : page});

    } catch (error) {
        console.log(error);
    }
}

const generatePdf = async (req , res)=>{
    try{
        const orders = await orderModel.find({ orderStatus: 'delivered' }).populate('user').populate('products.productId');
        const totalOrders = await orderModel.countDocuments()
        const totalProducts = await productmodel.countDocuments()
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
        const htmlContent = await ejs.renderFile('./views/admin/pdf.ejs', { orders , totalOrders, totalProducts, revenue});
       
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf.ejs');
        res.send(pdfBuffer);

    }catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
};

const excelReport = async(req , res)=>{
    try{
        const excelBuffer = await generateExcel();
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
        res.send(excelBuffer);

    }catch(error){
        console.log(error);
    }
}


async function generateExcel() {
    try {
        const workbook = new excel.Workbook();

        let totalOrders = await orderModel.countDocuments()
         const orders = await orderModel.find({ orderStatus: 'delivered' }).populate('user').populate('products.productId');
        let totalProducts = await orderModel.countDocuments()
        let totalRevenue  = await orderModel.aggregate([
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

        const worksheet = workbook.addWorksheet('Sales Report');
        
        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 15 },
            { header: 'Billing name', key: 'user', width: 20 },
            { header: 'Date', key: 'date', width: 25 },
            { header: 'Total', key: 'total', width: 15 },
            { header: 'Payment Method', key: 'payment', width: 15 }
        ];

        orders.forEach(order => {
            order.products.forEach(product => {
                const rowData = {
                    orderId: order._id,
                    user: order.user.name, 
                    date: order.orederDate,
                    total: order.subtotal,
                    payment: order.payment,
                    
                };
                worksheet.addRow(rowData);
            });
        });
          totalOrders = orders.length;
          totalProducts = 0;
          totalRevenue = 0;
        orders.forEach(order => {
            totalProducts += order.products.length;
            order.products.forEach(product => {
                totalRevenue += product.totalPrice;
            });
        });   

        worksheet.addRow({ total: 'Total Orders:', payment: totalOrders });
        worksheet.addRow({ total: 'Total Products:', payment: totalProducts });
        worksheet.addRow({ total: 'Total Revenue:', payment: totalRevenue });

        const buffer = await workbook.xlsx.writeBuffer();

        return buffer;
    } catch (error) {
        console.error('Error generating Excel:', error);
        throw error;
    }
}

module.exports = {
    getSales,
    generatePdf,
    excelReport
}