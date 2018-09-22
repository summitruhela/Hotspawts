const mongoose = require('mongoose')
let bookServices = mongoose.Schema({

    selectSchema: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'selectServices',
    },
    // customer_Id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'customer_user',
    // },
    // groomer_Id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'services',
    // },
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
            type: Date,// yyyy-mm-dd hr:min:sec
            default: null
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"]
        }
    },

})