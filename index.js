const path = require('path')
require('dotenv').config()
const express = require('express')
const app = express()
const userRoute = require('./routes/userRoute')
const adminRoute = require('./routes/adminRoute')
const session = require('express-session')
const config = require('./config/config')
const ejs = require('ejs')
const mongoose = require('mongoose')
const nocache = require('nocache')

//connect to mongodb
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
  

   // error middleware 

//    app.use((req, res, next) => {
//     res.status(404).sendFile(path.join(__dirname, 'views', '404.ejs'));
// });

app.use(nocache())
         
app.use(session({
    secret:"qwertyuiop",
    saveUninitialized :true,
    resave:false
}))
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.set('view engine','ejs')
app.set('views','./views/user')
app.set('views', path.join(__dirname, 'views/user'));
        
app.use(express.static('public'))

app.use('/',userRoute)

app.use('/admin',adminRoute)
app.use((req, res, next) => {
  res.status(404).render('404');
});

app.listen(3000,(req,res)=>{   
    console.log("server is listening http://localhost:3000");    

})


