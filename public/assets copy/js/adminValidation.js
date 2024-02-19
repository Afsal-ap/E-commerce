
// // add product validation

// document.addEventListener('DOMContentLoaded',function (){
//     function validateAddProductForm(){
//         clearErrorMessages();
//         let isValid = true;
       
//         // validate product title

//         let productTitle = document.getElementById('product-name')
//         if(productTitle === ''){
//             showError('productTitleError','product title cannot be empty')

//         }

//         // validate quantity

//         let quantity = document.getElementById('product-quantity').value.trim()
//         if(quantity === '' || isNaN(quantity) || parseInt(quantity) <= 0) {
//             showError('quantityError', 'Please enter valid quantity')
//             isValid = false
//         }

//         // validate Price
//         let price = document.getElementById('product-price').value.trim();
//         if (price === '' || isNaN(price) || parseFloat(price) <= 0) {
//             showError('priceError','Please enter a valid price')
//             isValid = false
//         }

//         // validate Description 

//         let description = document.getElementById('product-description').value.trim()
//         if(description === ''){
//             showError( 'descriptionError','Description cannot be empty')
//             isValid = false
//         }
//         let imageCount = 0

//         document.querySelectorAll('.form-control').forEach(function (element) {
//             if (element.files.length > 0){
//                 imageCount++
//             }
//         })
//         if(imageCount < 4) {
//             showError('imageError','Images cannot be emoty')
//             isValid = false
//         }
//         return isValid;
//     }
//     function showError(id, message){
//         document.getElementById(id).textContent = message
//     }
//     document.getElementById('addProductForm').addEventListener('submit',function(event){
//         if(!validateAddProductForm()) {
//             event.preventDefault();
//         }
//     })
// })






// document.addEventListener('DOMContentLoaded', function () {
//     function validateAddProductForm() {
//         clearErrorMessages();
//         let isValid = true;
//       console.log("hahahahhahaaaaaaaaaaaa");
//         // validate product title
//         let productTitle = document.getElementById('product-name').value.trim();
//         if (productTitle === '') {
//             showError('productTitleError', 'Product title cannot be empty');
//             isValid = false;
//         }

//         // validate quantity
//         let quantity = document.getElementById('product-quantity').value.trim();
//         if (quantity === '' || isNaN(quantity) || parseInt(quantity) <= 0) {
//             showError('quantityError', 'Please enter valid quantity');
//             isValid = false;
//         }

//         // validate Price
//         let price = document.getElementById('product-price').value.trim();
//         if (price === '' || isNaN(price) || parseFloat(price) <= 0) {
//             showError('priceError', 'Please enter a valid price');
//             isValid = false;
//         }

//         // validate Description
//         let description = document.getElementById('product-description').value.trim();
//         if (description === '') {
//             showError('descriptionError', 'Description cannot be empty');
//             isValid = false;
//         }

//         let imageCount = 0;

//         document.querySelectorAll('.form-control').forEach(function (element) {
//             if (element.files.length > 0) {
//                 imageCount++;
//             }
//         });

//         if (imageCount < 4) {
//             showError('imageError', 'Images cannot be empty');
//             isValid = false;
//         }

//         return isValid;
//     }

//     function showError(id, message) {
//         document.getElementById(id).textContent = message;
//     }

//     function clearErrorMessages() {
//         // Clear all error messages
       
//         document.getElementById('productTitleError').textContent = '';
//         document.getElementById('quantityError').textContent = '';
//         document.getElementById('priceError').textContent = '';
//         document.getElementById('descriptionError').textContent = '';
//         document.getElementById('imageError').textContent = '';
//     }

//     document.getElementById('addProductForm').addEventListener('submit', function (event) {
//         if (!validateAddProductForm()) {
//             event.preventDefault();
//         }
//     });
// });
