let customer = require("express").Router()
let customerHandler = require('../../fileHandler/customerHandler/customerHandler')

let authHandler=require('../../middleware/customer_auth_handler')

customer.post('/signup_user', customerHandler.signup_user);
customer.post('/login', customerHandler.login)
customer.post('/loginFB',customerHandler.loginFB)
customer.post('/signup_pet',customerHandler.signup_pet)
customer.post('/reset',authHandler.verifyToken, customerHandler.reset)
customer.post('/forgotPassword', customerHandler.forgotPassword)
customer.post('/homeScreen',authHandler.verifyToken, customerHandler.homeScreen)
customer.get('/groomerList',authHandler.verifyToken, customerHandler.groomerList)
customer.post('/showServices',authHandler.verifyToken, customerHandler.showServices)
customer.post('/selectServices',authHandler.verifyToken,customerHandler.selectServices)
customer.get('/showProfile',authHandler.verifyToken,customerHandler.showProfile)
customer.post('/editProfile',authHandler.verifyToken,customerHandler.editProfile)

customer.post('/payment', customerHandler.payment)
customer.post('/testing', customerHandler.testing)
customer.post('/copypet', customerHandler.copypet)
customer.post('/waterfall', customerHandler.waterfall)




module.exports = customer;
