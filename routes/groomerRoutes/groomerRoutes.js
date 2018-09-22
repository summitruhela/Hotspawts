var groomer = require('express').Router()
var groomerHandler = require('../../fileHandler/groomerHandler/groomerHandler')
var commonFunction = require('../../commonFile/commonFunction')
var authHandler = require('../../middleware/groomer_auth_handler')

groomer.post('/registration', groomerHandler.registration) //done
groomer.post('/login', groomerHandler.login)               //done
groomer.post('/loginFB',groomerHandler.loginFB)   //login through facebook
groomer.post('/forgotPassword',  groomerHandler.forgotPassword) //done
groomer.post('/reset', authHandler.verifyToken, groomerHandler.reset)               //done
groomer.post('/editProfile', authHandler.verifyToken, groomerHandler.editProfile)  
// groomer.post('/changePassword', authHandler.verifyToken, groomerHandler.changePassword)
groomer.get('/myProfile', authHandler.verifyToken, groomerHandler.myProfile) //done
groomer.post('/setService', authHandler.verifyToken, groomerHandler.setService)  
groomer.post('/setSchedule', authHandler.verifyToken, groomerHandler.setSchedule)
groomer.post('/addServices',authHandler.verifyToken,groomerHandler.addServices)
groomer.post('/show', authHandler.verifyToken, groomerHandler.show)

module.exports = groomer;