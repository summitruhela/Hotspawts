//const express = require('express');
var bcrypt = require("bcrypt-nodejs")
var signup_userModel = require('../../dbSchema/customerModel/signupSchema')
var signup_petModel = require('../../dbSchema/customerModel/signup_pet')
const service_groomerModel = require('../../dbSchema/groomerModel/servicesGroomer')
const signup_groomerModel = require('../../dbSchema/groomerModel/signup_groomer')
const customer_service = require("../../dbSchema/customerModel/selectServices")
var commonFile = require('../../commonFile/commonFunction')
var jwt = require("jsonwebtoken")
var asyncLoop = require('node-async-loop');
var booked_services = require('../../dbSchema/customerModel/bookGroomer')
var config = require("../../config/config.dev")
var config_json = require("../../config/config.json")
var imagefunction = require('../../commonFile/uploadMedia')
var stripe = require('stripe')(config_json.stripe.secretKey);
var log = console.log
let salt = bcrypt.genSaltSync(10)
var mongoose = require('mongoose')
const Response = require('../../commonFile/response_handler');
const resCode = require('../../helper/httpResponseCode')
const resMessage = require('../../helper/httpResponseMessage');
const async = require('async');
//signup-user
const signup_user = (req, res) => {
    if (!req.body.name || !req.body.password || !req.body.email || !req.body.phoneNumber) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    } else if (req.body.name || req.body.password || req.body.email || req.body.phoneNumber) {
        var obj = {
            // password: commonFile.encrypt(req.body.password.toString()),
            password: req.body.password,
            email: req.body.email,
            name: req.body.name,
            location: req.body.location,
            phoneNumber: req.body.phoneNumber,
            image: null
        }
        console.log("-------------------------->", typeof (obj.phoneNumber))
        obj.password = bcrypt.hashSync(req.body.password, salt)

        if (req.body.email) {
            signup_userModel.findOne({
                email: req.body.email
            }, (err, result) => {
                log("#########")
                // var place = commonFile.getPlace(obj.location.coordinates)
                // console.log(place)
                if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                else if (result) Response.sendResponseWithoutData(res, resCode.ALREADY_EXIST, resMessage.ALL_READY_EXIST_EMAIL)

                else {
                    // var place = commonFile.getPlace(obj.location.coordinates)
                    // console.log(place)
                    imagefunction.uploadImg(req.body.image, (err, success) => {
                        if (err) {
                            Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                        } else if (!success) {
                            Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                        } else {
                            obj.image = success
                            signup_userModel.create(obj, (err, result) => {
                                if (err) {
                                    Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                                } else {
                                    log(result)
                                    signup_petModel.create({
                                        customer_Id: result._id
                                    });
                                    customer_service.create({
                                        customer_Id: result._id
                                    })
                                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.EVERYTHING_IS_OK, result)
                                }
                            })
                        }
                    })
                }
            })
        }
    }
}
//login-user
const login = (req, res) => {
    log("login-api")
    let obj = {
        email: req.body.email,
        password: req.body.password
    }
    if (!obj.email || !obj.password) {
        log("missing parameter")
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    }
    // log(obj.email)
    signup_userModel.findOne({
        email: obj.email
    }, (err, result) => {
        if (err) {
            Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
        } else if (!result) {
            Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
        } else if (result) {
            const update = bcrypt.compareSync(obj.password, result.password)
            if (update) {
                var token = jwt.sign({
                    id: result._id
                }, config.secret, {
                        expiresIn: 86400
                    })
                // return commonFile.responseHandler(res, 200, "success", update, token)
                Response.sendResponseWithToken(res, resCode.EVERYTHING_IS_OK, resMessage.EVERYTHING_IS_OK, token)
            } else {
                console.log("ERRRRRRRR", update)
                Response.sendResponsewithError(res, resCode.UNAUTHORIZED, resMessage.UNAUTHORIZED, "PASSWORD INCORRECT")
            }
        }
    })
}
//login-facebook
loginFB = (req, res) => {
    console.log("loginFB")
    var obj = {
        facebook: req.body.facebook
    }

    if (obj) {
        signup_userModel.findOne({
            $and: [{
                email: obj.facebook.email
            }, {
                facebook: obj.facebook
            }]
        }, (err, result) => {

            if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
            if (!result) {
                signup_userModel.create({
                    facebook: obj.facebook,
                    email: obj.facebook.email
                }, (err, result) => {
                    console.log("@#$!@$!@#$!@#$!@#$!@#$!@#$", result)
                    if (err)
                        Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                    else if (!result)
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                    else {
                        console.log("@#$@##$@#4")
                        signup_petModel.create({
                            customer_Id: result._id
                        });
                        var token = commonFile.jwtEncode(result._id)
                        Response.sendResponseWithToken(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_UPDATE, token)
                    }
                })
            } else {
                log("result--->>>", result._id)
                var token = commonFile.jwtEncode(result._id)
                log(token)
                Response.sendResponseWithToken(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, token)
            }

        })
    } else {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.PARAMETER_IS_MISSING)
    }
}

//signup-pet
signup_pet = (req, res) => {
    console.log("signUP pet")
    var x = []
    obj = {
        pet_info: req.body.pet_info,
        customer_Id: req.body.customer_Id
    }

    if (!obj) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.PARAMETER_IS_MISSING)
    } else if (obj) {
        var errCount = 1
        async.forEachOf(obj.pet_info, (value, i, callback) => {
            // console.log(key , value)

            commonFile.uploadMultipleImages(value.image, (err, result) => {
                if (err) {
                    errCount++;
                } else if (!result) {
                    errCount++;
                } else {
                    obj.pet_info[i].image = result;
                    callback()
                }
            })
        }, (err, ress) => {
            if (err) {
                console.log('err final')
            } else {
                console.log('final succ =.')
                if (errCount == 1) {
                    signup_petModel.findOneAndUpdate({
                        customer_Id: obj.customer_Id
                    }, {
                            $set: {
                                pet_info: obj.pet_info
                            }
                        }, {
                            new: true
                        }, (err, result) => {
                            if (err) {
                                return Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                            } else if (!result) {
                                return Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                            } else {
                                var token = commonFile.jwtEncode(obj.customer_Id)
                                console.log("token--->>", token)
                                return Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, token)
                            }
                        })
                } else {
                    return Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, "BASE 64 error")
                }
            }
        })
    }
}
//testing of pet
const copypet = (req, res) => {
    console.log("testing pet")
    var x = []
    obj = {
        pet_info: req.body.pet_info,
        customer_Id: req.body.customer_Id
    }

    if (!obj) {
        Response.sendResponseWithoutData(res, resCode.BAD_REQUEST, resMessage.NOT_FOUND)
    } else if (obj) {
        var errCount = 1
        async.forEachOf(obj.pet_info, (value, i, callback) => {
            // console.log(key , value)

            commonFile.uploadMultipleImages(value.image, (err, result) => {
                if (err) {
                    errCount++;
                } else if (!result) {
                    errCount++;
                } else {
                    obj.pet_info[i].image = result;
                    callback()
                }
            })
        }, () => {
            if (false) {
                console.log('err final')
            } else {
                console.log('final succ =.')
                if (errCount == 1) {
                    signup_petModel.findOneAndUpdate({
                        customer_Id: obj.customer_Id
                    }, {
                            $set: {
                                pet_info: obj.pet_info
                            }
                        }, {
                            new: true
                        }, (err, result) => {
                            if (err) {
                                return Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                            } else if (!result) {
                                return Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                            } else {
                                return Response.sendResponseWithData(res, "200", resCode.EVERYTHING_IS_OK, result)
                            }
                        })
                } else {
                    return Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                }
            }
        })

    }
}
//reset
const reset = (req, res) => {
    log("reset-api")
    var obj = {
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword,
        // email: req.body.email,
        token: req.headers.token

    }
    if (!obj.oldPassword || !obj.newPassword || !obj.confirmPassword) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    } else if (obj.oldPassword == obj.newPassword || obj.oldPassword == obj.confirmPassword) {
        Response.sendResponseWithoutData(res, resCode.SOMETHING_WENT_WRONG, "OLD AND NEW PASSWORD ARE SAME")
    } else {
        commonFile.jwtDecode(obj.token, (result) => {
            if (!result) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
            } else {
                // console.log(result)
                log("@@@@@@@@@", result)
                signup_userModel.findById({
                    _id: result
                }, (err, result) => {
                    if (err) {
                        throw err
                    } else if (!result.password) {
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "FIRST FORGOT PASSWORD")
                    } else {
                        console.log("result", result.password)
                        var checkPassword = bcrypt.compareSync(obj.oldPassword, result.password)
                        log("$$$$$$$", checkPassword)
                        if (checkPassword) {
                            var password = bcrypt.hashSync(obj.newPassword, salt)
                            signup_userModel.findOneAndUpdate({
                                _id: result
                            }, {
                                    $set: {
                                        password: password
                                    }
                                }, (err, result) => {
                                    if (err) {
                                        Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                                    } else if (!result) {
                                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                                    } else {
                                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.EVERYTHING_IS_OK, "done")

                                    }
                                })
                        } else {
                            console.log("#$@#$@#$@#@#$@#4")
                            Response.sendResponsewithError(res, resCode.UNAUTHORIZED, resMessage.INCORRECT_PASSWORD)
                        }
                    }
                })
            } //end
        })
    }
}

//forgotpassword
const forgotPassword = (req, res) => {
    log("forgot-password")
    obj = {
        email: req.body.email
    }
    if (!obj) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    }
    signup_userModel.findOne({
        email: obj.email
    }, (err, result) => {
        if (err) {
            Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
        } else if (!result) {
            Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
        } else if (result) {
            var token = jwt.sign({
                id: result._id
            }, config.secret, {
                    expiresIn: 86400
                })
            commonFile.sendMail(result.email, "FORGOT PASSWORD", token, (err, send) => {
                if (err) {
                    log(err)
                    Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
                } else if (!send) {
                    Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                } else {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.MAIL_SENT)
                }
            })
        }
    })
}
// db.groomeruser.find({point: {$near: {$geometry:{type: "Point",coordinates: [-84.26060492426588, 30.45023887165371]}}}})

//Home screeen
const homeScreen = (req, res) => {
    log("homeScreen")
    var long = parseFloat(req.body.long)
    var lat = parseFloat(req.body.lat)
    obj = {
        long: long,
        lat: lat
    }
    location = [obj.long, obj.lat]
    radius = 8046.72
    console.log(obj)
    if (!obj) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    } else {
        signup_groomerModel.aggregate([{
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: location
                },
                distanceField: "dist.calculated",
                maxDistance: radius,
                query: {},
                includeLocs: "dist.location",
                num: 5,
                spherical: true,
            }
        }, {
            $project: {
                "location": 1,
                "_id": 1,
                "distance": 1,
                "name": 1,
                'image': 1
            }
        }], (err, result) => {
            console.log("-->", err)
            console.log("$$$$$$", result)
            if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
            else if (!result) Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
            else Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.EVERYTHING_IS_OK, result)
        })
    }
}

//groomer list 
const groomerList = (req, res) => {
    log("groomer--list")
    signup_groomerModel.find({}, {
        name: 1,
        image: 1
    }, (err, result) => {
        if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR)
        else if (!result) Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
        else Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.EVERYTHING_IS_OK, result)
    })
}
//select-services
const showServices = (req, res, callback) => {
    log('show services')
    obj = {
        groomer_Id: req.body.groomer_Id,
        setservices: req.body.getservices,
        token: req.headers.token,
        service_Id: req.body.service_Id
    }
    if (obj) {
        commonFile.jwtDecode(req.headers.token, (resultToken) => {
            if (!resultToken) {
                log("not found")
            } else {
                console.log(resultToken)
                // console.log('--------------------------->', obj)
                service_groomerModel.aggregate([{
                    $match: {
                        "groomer_Id": mongoose.Types.ObjectId(obj.groomer_Id)
                    }
                },
                {
                    $project: {
                        'services': {
                            $filter: {
                                input: '$services',
                                as: 'service',
                                cond: {
                                    $eq: ['$$service.status', 'ACTIVE']
                                }
                            }
                        },
                    }
                }
                ], (err, result) => {
                    if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                    else if (!result) {
                        console.log("RESULT NOT FOUND")
                    } else {
                        data = result[0].services;
                        for (var j = 0; j < data.length; j++) {
                            console.log("************", data[j]);
                            // console.log(obj.service_Id.length)
                            for (var i = 0; i < obj.service_Id.length; i++) {

                                if (data[j]._id == obj.service_Id[i]) {
                                    console.log("match")
                                    console.log("if-->>", data[j].status)
                                    data[j].status = "ACTIVE"
                                    break;
                                }
                                else if (data[j]._id != obj.service_Id[i]) {
                                    console.log("else --->>", data[j].status)
                                    console.log('%%%%%%%%%%%%%%%', data[j])
                                }
                            }
                        }
                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, data)

                        //     customer_service.findOneAndUpdate({ customer_Id: resultToken }, {
                        //         $set: {
                        //             services: data
                        //         }
                        //     }, { new: true }, (err, result) => {
                        //         console.log(err, result)
                        //     Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, result)
                        // })
                    }
                }, callback(result))
            }
        })
    }
}
//select-services
const selectServices = (req, res) => {
    console.log("SELECT SERVICES")
    console.log(req.body.service_Id)
    obj = {
        service_Id: req.body.service_Id,
        price: req.body.price
    }
    var counter = 0;
    var service_Id = req.body.service_Id
    service_Id.map((x) => {
        customer_service.findOneAndUpdate({ "services._id": x }, { $set: { "services.$.status": "Active" } }, { new: true },
            (err, result) => {
                //  console.log(err, result)
                counter++;
                if (result)
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, result)
                else (!result)
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOTHING_TO_SELECT)
            })
    })
}
//show Profile

showProfile = (req, res) => {
    obj = {
        token: req.headers.token
    }
    if (!obj) {       
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND);
    } else {
        commonFile.jwtDecode(obj.token, (err, result) => {
            if (err) {
                Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err);
            } else if (!result) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND);

            } else {
                console.log("else=====", result);
             signup_petModel.findOne({ customer_Id: result }, { password: 0 },).populate({ path: "customer_Id" }).exec((err, profiledetails) => {
                    console.log('show profile===',profiledetails);
                    if (err) {
                        Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err);
                    } else {
                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.EVERYTHING_IS_OK, profiledetails);
                    }
                })
            }
        })
    }
},

//edit profile
editProfile = (req, res) => {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%")
    obj = {
        token: req.headers.token
    }

    if (!obj) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND);
    }
    else {
        commonFile.jwtDecode(obj.token, (err, result) => {
            if (err) {
                Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err);
            } else {
                var name = req.body.name;
                var image = req.body.image;
                var location = req.body.location;
                var phoneNumber = req.body.phoneNumber;
                imagefunction.uploadImg(image, (err, base64image) => {
                    if (err) {
                        Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err);
                    }
                    else {
                        signup_userModel.findByIdAndUpdate({ _id: result }, { $set: { name: name, image: base64image, location: location, phoneNumber: phoneNumber } }, { new: true }, (err, updateprofile) => {
                            if (err) {
                                Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err);
                            }
                            else {
                                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.EVERYTHING_IS_OK, updateprofile);
                            }
                        })
                    }
                });
            }
        })
    }
},
//waterfall model


waterfall = (req, res, next) => {
    log('show services')
    obj = {
        groomer_Id: req.body.groomer_Id,
        setservices: req.body.getservices,
        token: req.headers.token,
        service_Id: req.body.service_Id
    }
    async.waterfall([

        function (callback) {
        }
    ], (err, result) => {
        console.log("$$$$$$$$$$$$$$$$$$$$$$", err, result)
    })
}
//payment-stripe
const payment = (req, res) => {
    log('payment-services')

    stripe.customers.create({
        email: 'me-sumit@mobiloitte.com'
    },
        function (err, customer) {

            err; // null if no error occurred
            customer; // the created customer object
        }
    );
}
//testing
const testing = (req, res) => {
    log("TESTING")
    obj = {
        groomer_Id: req.body.groomer_Id,
        customer_Id: req.body.customer_Id
    }
    service_groomerModel.find({
        groomer_Id: obj.groomer_Id
    })
        // selectServices.update({
        //     $set: {
        //         customer_Id: obj.customer_Id,
        //         groomer_Id:obj.groomer_Id
        //     }
        // })
        .exec((err, result) => {
            console.log(err, result)
            if (result) {
                console.log("--------->", result.groomer_Id)
            }
            res.json(result);
        })
}

module.exports = {
    signup_user,
    login,
    loginFB,
    signup_pet,
    reset,
    forgotPassword,
    homeScreen,
    groomerList,
    showServices,
    selectServices,
    showProfile,
    editProfile,
    payment,
    testing,
    waterfall,
    copypet

}