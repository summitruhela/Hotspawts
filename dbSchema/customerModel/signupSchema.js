const mongoose = require("mongoose")
let user = mongoose.Schema({
    name: {
        type: String,
        require: false
    },
    email: {
        type: String,
        require: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique: false
    },
    phoneNumber: {
        type: Number,
        require: false
    },
    location: {
        place: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }

    },
    password: {
        type: String,
        unique: false
    },
    image: {
        type: String,
        default: null
    },
    facebook: {
        email: String,
        name: String,
        token: String,
        id: Number
    }
}, {
        timestamps: true
    })

module.exports = mongoose.model("customer_user", user, "customer_user")