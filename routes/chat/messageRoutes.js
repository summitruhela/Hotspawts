var chatRouter = require("express").Router()
var chatHandler = require('../../fileHandler/chat/messgaeHandler')

chatRouter.post('/message',chatHandler.message)

module.exports=chatRouter