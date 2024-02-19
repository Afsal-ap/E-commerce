
const multer = require('multer');



// Multer configuration
const localStorage = multer.diskStorage({
        destination: "public/multerImages" ,
         
        filename: (req, file, callback) => {
            const filename = file.originalname
            callback(null, filename); 
        },
       
    });

 const products = multer({ storage: localStorage });
 console.log(products);

 const uploadproduct = products.fields([
    { name: "image1", maxCount:1 },
    { name: "image2", maxCount:1 },
    { name: "image3", maxCount:1 },
    { name: "image4", maxCount:1 },
])



module.exports = {
    uploadproduct
} 