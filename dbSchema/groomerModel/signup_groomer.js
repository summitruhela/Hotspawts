const mongoose = require("mongoose");
let signup = mongoose.Schema({
    name: {
        type: String,
        unique: false,
        require: false
    },
    email: {
        type: String,
        unique: false,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        require: false
    },
    phoneNumber: {
        type: Number,
        require: false,
        unique: false
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
        unique: false,
        require: false
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

// signup.pre('save', function (next) {
//     // get the current date
//     var currentDate = new Date();
//     rating = 0;
//     // change the updated_at field to current date
//     this.updated_at = currentDate;

//     // if created_at doesn't exist, add to that field
//     if (!this.created_at)
//         this.created_at = currentDate;
//     next();
// });
// signup.index({ location: '2dsphere' });
// signup.index({ location: '2d' }); 
signup.index({ 'location.coordinates': '2dsphere' });
module.exports = mongoose.model("groomer_user", signup, "groomeruser")
