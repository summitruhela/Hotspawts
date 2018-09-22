var mongoose = require('mongoose')
let message = mongoose.Schema({

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'signup_user'
    },
    groomerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groomer_user'
    },
    message: [
        {
            customerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "signup_user"
            },
            groomerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'groomer_user'
            },
            messsage: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],


})


module.exports = mongoose.model("message", message, 'message')