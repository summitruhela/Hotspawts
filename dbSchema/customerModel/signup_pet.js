var mongoose = require("mongoose")
var signup_pet = mongoose.Schema({

    customer_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer_user"
    },
    pet_info: [{
        name: {
            type: String
        },
        breed: {
            type: String
        },
        price: {
            type: Number
        },
        image: [{
            type: String,
            default: null,
            required:true
        }]
    }]
}, {
        timestamps: true
    })

module.exports = mongoose.model("customer_pet", signup_pet, "customer_pet")