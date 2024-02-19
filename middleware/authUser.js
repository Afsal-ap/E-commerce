
// const session = require('express-session')

// const isLogin = async (req,res, next) => {
//     try{
//         if (req.session.user_id) {
//             const userId = req.session.user_id || null;
//             req.userId = userId;
//             next()
//         }else{
//             res.redirect(`authentication?message=${encodeURIComponent("please login")}`)
//         }
//     } catch(error){
//         console.log(error.message)
//     }
// }