const mongoose = require('mongoose')
let service = mongoose.Schema({

    groomer_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "groomer_user"
    },
    services: [{
        name: String,
        price: Number,
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            uppercase: true,
            default: "inactive"
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
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("services", service, "services")