const mongoose = require('mongoose')
let selectServices = mongoose.Schema({
    customer_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customer_user',
    },
    services: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'services',
    },
    price: Number,
    services: [{
        name: String,
        price: Number,
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            uppercase: true,
            default: "INACTIVE"
        }
    }],

    schedule: {
        date: {
            type: Date, // yyyy-mm-dd hr:min:sec
            default: null
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"]
        }
    },

}, {
        timestamps: true
    })
module.exports = mongoose.model('selectServices', selectServices, 'select_Services')