
const categoryModel = require('../models/categorymodel')
const Product = require('../models/productmodel')
const offerModel   = require('../models/offerModel')

// load product

const loadProduct = async (req,res)=>{
    try{ 
      const page = parseInt(req.query.page) || 1;
            const pageSize = 5; 
            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts / pageSize);
            const  categories = await categoryModel.find({}).populate('offer')
            const products = await Product.find().populate( 'categoryId'
           ).populate('offer')
           .skip((page - 1) * pageSize)
           .limit(pageSize);
        const offers  = await offerModel.find({})
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
        if(product.offer){   
            const discountedPrice = product.price * ( 1 - product.offer.discountAmount / 100)
            const dis =  product.price - discountedPrice
           product.discountedPrice = parseInt(discountedPrice)
            console.log(dis,"discouteyy");
            await product.save()  
        }
      }

        res.render('product',{products,offers, totalPages,currentPage:page , categories})
       } catch(error){
        console.error(error);
    }
    }


 // load addProduct 

 const loadAddProduct = async (req,res) =>{
    try{
       
        const datas = await categoryModel.find({is_blocked:false})
        res.render('addProducts',{datas})
    } catch(error){
        console.log(error);
    }
}

//add Product post

const addProductPost = async (req,res)=>{
    try{ 
        
        details = req.body
        const images = req.files
        console.log(images,'ddddd');

        const img = [
            images && images.image1 ? images.image1[0].filename : null,
            images && images.image2 ? images.image2[0].filename : null,
            images && images.image3 ? images.image3[0].filename : null,
            images && images.image4 ? images.image4[0].filename : null,
        ]

        

        const product = new Product({
            name : details.name,
            quantity : details.quantity,
            price : details.price,
            categoryId : details.category,
            description :details.description,
            images:{
            image1:img[0],
            image2:img[1],
            image3:img[2],
            image4:img[3],
            }
        })
        await product.save()
        res.redirect('/admin/product')
    } catch(error){
        console.log(error);
    }
}


  // list and unlist product

  const listProduct = async (req,res) => {
    try{     

         console.log("hello");
            const { id } = req.params;
        
            const product = await Product.findOne({_id:id});
            if (!product) {
              return res.status(404).json({ error: ' not found' });
            }
        
            product.is_blocked = !product.is_blocked;
            await product.save();
        
        
            res.json({ listProduct: true });   
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
          }
}
   

const unlistProduct = async (req, res) => {
    try { 
         console.log("hhi");
      const { id } = req.params;
  
      
      const product = await Product.findOne({_id:id});
      if (!product) {
        return res.status(404).json({ error: ' not found' });
      }
  
     
       product.is_blocked = false;
      await product.save();
  
    
  
      res.json({ unlistProduct: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
   
    // load  Edit product 

    const editProduct = async (req,res) =>{

        try{    
            const id = req.query.id
            const targetProduct  = await Product.findOne({_id:id}).populate('categoryId')
            const categories  = await categoryModel.find({is_blocked :false})
            res.render('editProduct',{ data:targetProduct , data1 : categories })
        }catch(error){
            console.log(error);
    } 
    }
     
  // edit product post 

  const editProductPost = async(req,res) =>{
     try{
       
        const id = req.query.id
        console.log(id);
        const productDetails  = req.body
        const files = req.files
        const categoryId = productDetails.categoryId;

        const targetProduct = await Product.findOne({_id:id})

        const img = [
            files?.image1 ? (files.image1[0]?.filename || targetProduct.images.image1) : targetProduct.images.image1,
            files?.image2 ? (files.image2[0]?.filename || targetProduct.images.image2) : targetProduct.images.image2,
            files?.image3 ? (files.image3[0]?.filename || targetProduct.images.image3) : targetProduct.images.image3,
            files?.image4 ? (files.image4[0]?.filename || targetProduct.images.image4) : targetProduct.images.image4,
        ];

        const product = {
            name:productDetails.name,
            quantity:productDetails.quantity,
            categoryId:categoryId,
            price:productDetails.price,
            description:productDetails.description,
            images:{ 
                image1:img[0],
                image2:img[1],
                image3:img[2],
                image4:img[3]
            }

        }
        const result = await Product.findOneAndUpdate({_id:id}, product,{new:true});
        res.redirect('/admin/product')
     } catch(error){
        console.log(error);
     }
  }

 

module.exports = {

    loadAddProduct,
    loadProduct,
    addProductPost,
    unlistProduct,
    listProduct,
    editProduct,
    editProductPost
}