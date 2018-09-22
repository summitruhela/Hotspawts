const express = require('express');
const signup_groomerModel = require('../../dbSchema/groomerModel/signup_groomer')
const service_groomerModel = require('../../dbSchema/groomerModel/servicesGroomer')
var commonFile = require('../../commonFile/commonFunction')
var imageFunction = require('../../commonFile/uploadMedia')
var bcrypt = require("bcrypt-nodejs")
let salt = bcrypt.genSaltSync(10)
var config = require("../../config/config.dev")
var jwt = require("jsonwebtoken")
const Response = require('../../commonFile/response_handler');
const resCode = require('../../helper/httpResponseCode')
const resMessage = require('../../helper/httpResponseMessage');
var log = console.log
//registration
const registration = (req, res) => {
    log("registration")
    obj = {
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
        password: req.body.password,
        confirmPassword: req.body.password,
        image: null,
    }
    if (!obj.name || !obj.email || !obj.phoneNumber || !obj.password || !obj.confirmPassword) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    } else if (obj) {
        signup_groomerModel.findOne({
            email: obj.email
        }, (err, result) => {
            if (err) {
                log('first')
                Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
            } else if (result) {

                Response.sendResponseWithoutData(res, resCode.all, resMessage.ALL_READY_EXIST_EMAIL)
            } else {
                imageFunction.uploadImg(req.body.image, (err, result) => {
                    if (err) {
                        console.log("second")
                        Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                    } else if (!result)
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, "IMAGE URL NOT FOUND")
                    else if (result) {
                        obj.image = result
                        console.log("object ---->>>", obj)
                        // log(obj)
                        obj.password = bcrypt.hashSync(obj.password, salt)
                        signup_groomerModel.create(obj, (err, result) => {
                            if (err) {
                                console.log("third", err)
                                Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                            } else if (!result) {
                                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                            } else {
                                console.log(result._id)
                                service_groomerModel.create({
                                    groomer_Id: result._id
                                });
                                result = {
                                    _id: result._id,
                                    name: result.name,
                                    email: result.email,
                                    phoneNumber: result.phoneNumber
                                }
                                var token = commonFile.jwtEncode(result._id)
                                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.SAVED_SUCCESSFULLY, token)
                            }
                        })
                    }
                })
            }
        })
    }
}

//login throughfb
loginFB = (req, res) => {
    console.log("loginFB groomerID")
    // if (!req.body.name || !req.body.password || !req.body.email || !req.body.phoneNumber) {
    //     Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    // }
    var obj = {
        facebook: req.body.facebook
    }

    if (obj) {
        console.log("@@@@@@@@@@@@@@@@@@@@@@@@@", obj)
        signup_groomerModel.findOne({
            $and: [{
                email: obj.facebook.email
            }, {
                facebook: obj.facebook
            }]
        }, (err, result) => {
            console.log("!!!!!!!!!!!!!!!!", err, "%%%%%%%%%%%%%%%%%%%%%%%%", result)
            if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
            if (!result) {
                console.log("###################")
                signup_groomerModel.create({
                    facebook: obj.facebook,
                    email: obj.facebook.email
                }, (err, result) => {
                    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!11", result)
                    if (err)
                        Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                    else if (!result)
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                    else {
                        console.log("&&&&&&&&&&&&&&&&&&&&&")
                        service_groomerModel.create({
                            groomer_Id: result._id
                        });
                        var token = commonFile.jwtEncode(result._id)
                        Response.sendResponseWithToken(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, token)
                    }
                })
            } else {
                log("result--->>>", result._id)
                var token = commonFile.jwtEncode(result._id)
                // var token=jwt.sign({id:result._id},config.secret,{expiresIn:86600})
                log(token)
                Response.sendResponseWithToken(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, token)
            }
        })
    }
}

//login-groomer
login = (req, res) => {
    obj = {
        email: req.body.email,
        password: req.body.password
    }
    if (!obj.email || !obj.password)
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    else if (obj) {
        signup_groomerModel.findOne({
            email: obj.email
        }, (err, result) => {
            if (err) {
                Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
            } else if (!result) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
            } else {
                const check = bcrypt.compareSync(obj.password, result.password)
                if (!check) {
                    return commonFile.responseHandler(res, 500, "WRONG PASSWORD")
                } else {
                    var token = jwt.sign({
                        id: result._id
                    }, config.secret, {
                            expiresIn: 86400
                        })
                    return commonFile.responseHandler(res, 200, "SUCCESSFULLY LOGIN", token)
                }
            }
        })
    }
}
//forgot-password
forgotPassword = (req, res) => {
    log("forgot password")
    obj = {
        token: req.body.token,
        email: req.body.email
    }
    if (!obj) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    } else {
        //commonFile.jwtDecode(token)
        signup_groomerModel.findOne({
            email: obj.email
        }, (err, result) => {
            if (err) {
                Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
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
                        Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                    } else if (!send) {
                        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                    } else {
                        Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.MAIL_SENT)
                    }
                })
            }
        })
    }
}
//reset-password
reset = (req, res) => {
    log("reset-api")
    var obj = {
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword,
        // email: req.body.email,
        token: req.headers.token

    }
    console.log("objectssssss", obj)
    if (!obj.oldPassword || !obj.newPassword || !obj.confirmPassword) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    } else if (obj.oldPassword == obj.newPassword) {
        Response.sendResponseWithoutData(res, resCode.SOMETHING_WENT_WRONG, resMessage.CHOOSE_DIFFERENT_PASSWORD)
    } else {
        commonFile.jwtDecode(obj.token, (result) => {
            console.log("%%%%%%$%$%$%$%$", result)
            if (!result) {
                Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
            } else {
                // console.log(result)
                log("@@@@@@@@@", result)
                signup_groomerModel.findById({
                    _id: result
                }, (err, result) => {
                    if (err) throw err
                    else {
                        var checkPassword = bcrypt.compareSync(obj.oldPassword, result.password)
                        log("$$$$$$$", checkPassword)
                        if (checkPassword) {
                            var password = bcrypt.hashSync(obj.newPassword, salt)
                            signup_groomerModel.findOneAndUpdate({
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
//groomer edit profile
editProfile = (req, res) => {
    log("editProfile")
    obj = {
        _id: req.body._id,
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        location: req.body.location,
    }
    if (!obj.name || !obj.email || !obj.phoneNumber || !obj.location) {
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    } else {
        log(obj)
        signup_groomerModel.findOneAndUpdate({
            _id: obj._id
        }, {
                $set: {
                    name: obj.name,
                    email: obj.email,
                    phoneNumber: obj.phoneNumber,
                    location: obj.location
                }
            }, (err, result) => {
                if (err) {
                    Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                } else if (!result) {
                    Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                } else {
                    return commonFile.responseHandler(res, 200, "SUCCESSFULL", result)
                }
            })
    }
}

//myProfile
myProfile = (req, res) => {
    log('myprofile')
    obj = {
        _id: req.headers.token
    }
    log(obj)
    commonFile.jwtDecode(obj._id, (result) => {
        if (!result) {
            console.log("token invalid")
        } else if (result) {
            obj._id = result
        }
    })
    log(obj)
    if (obj) {
        signup_groomerModel.findById({
            _id: obj._id
        }, {
                phoneNumber: 1,
                name: 1,
                email: 1,
                location: 1
            }, (err, result) => {
                if (err) {
                    Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                } else if (!result) {
                    Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                } else {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, result)
                }
            })
    }
}
//set-service
setService = (req, res) => {
    log('set-services')
    obj = {
        // groomerId: req.body.groomerId,
        token: req.headers.token,
        // status: req.body.services.status
        status: req.body.status
    }

    if (!obj)
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    else {
        log(obj)
        commonFile.jwtDecode(obj.token, (result) => {
            // console.log("%%%%%%%", result)
            service_groomerModel.findOne({
                groomer_Id: result
            }, (err, result) => {
                // res.json(result)
                if (err) throw err
                else { //{"Items.$": 1}
                    var status = req.body.status;
                    service_groomerModel.findOneAndUpdate({
                        "setService.services._id": req.body._id
                    }, {
                            $set: {
                                "setService.services.$.status": status
                            }
                        },
                        // {$set:{status:obj.status}},
                        // {"setService.services.$._id":1,_id:0},
                        {
                            new: true
                        },
                        (err, result) => {
                            if (err) throw err
                            else {
                                console.log("result", JSON.stringify(result))
                                Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.SUCCESSFULLY_DONE, result)

                            }
                        })
                }
                // if (err) throw err
                // else
                //     console.error("DATA FOUND", result)
                // if (err) throw err
                // else if (!result)
                //     console.log("error on tokenverification")
                // else {
                //     log("$%&#&#$@#$^#456234", result._id)
                //     service_groomerModel.findOneAndUpdate({ groomer_Id: result._id }, {
                //         $push: {
                //             "setService.services": obj.services
                //         }, "setService.status": obj.status
                //     }, { new: true }, (err, result) => {
                //         log("##########", err, result)
                //         if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                //         else if (!result) Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                //         else return commonFile.responseHandler(res, 200, "SUCCESSFULLY DONE", result)
                //     })
                // }
            })

        })
    }
}
//set-schedule
setSchedule = (req, res) => {
    log('setschedule')
    obj = {
        schedule: req.body.schedule,
        // userId: req.body.userId
        groomer_Id: req.body.groomer_Id
    }
    log(obj)
    if (!obj) Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    else {
        service_groomerModel.findOneAndUpdate({
            groomer_Id: obj.groomer_Id
        }, {
                $set: {
                    schedule: obj.schedule
                }
            }, (err, result) => {
                log("--->>", err, result)
                if (err) {
                    Response.sendResponseWithData(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                } else if (!result) {
                    Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                } else {
                    Response.sendResponseWithData(res, resCode.EVERYTHING_IS_OK, resMessage.done)
                }

            })
    }
}

//add-services
addServices = (req, res) => {
    log('set-services')
    obj = {
        // groomerId: req.body.groomerId,
        token: req.headers.token,
        services: req.body.services,
    }
    if (!obj)
        Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.REQUIRED_DATA)
    else {
        log(obj)
        commonFile.jwtDecode(obj.token, (result) => {
            console.log("%%%%%%%", result)
            signup_groomerModel.findById({
                _id: result
            }, (err, result) => {
                if (err) throw err
                else if (!result)
                    console.log("error on tokenverification")
                else {
                    log("$%&#&#$@#$^#456234", result._id)
                    service_groomerModel.findOneAndUpdate({
                        groomer_Id: result._id
                    }, {
                            $push: {
                                "services": obj.services
                            },
                        }, {
                            new: true
                        }, (err, result) => {
                            log("##########", err, result)
                            if (err) Response.sendResponsewithError(res, resCode.INTERNAL_SERVER_ERROR, resMessage.INTERNAL_SERVER_ERROR, err)
                            else if (!result) Response.sendResponseWithoutData(res, resCode.NOT_FOUND, resMessage.NOT_FOUND)
                            else return commonFile.responseHandler(res, 200, "SUCCESSFULLY DONE", result)
                        })
                }
            })

        })
    }
}
//testing 
show = (req, res) => {
    console.log('testing')

    service_groomerModel.findById({ _id: req.body._id }).populate({ path: "userId", select: "name" }).exec((err, result) => {
        console.log(err, result)
        return commonFile.responseHandler(res, 200, "qweyuiop", result)
    })
}

module.exports = {
    registration,
    login,
    loginFB,
    forgotPassword,
    reset,
    editProfile,
    // changePassword,
    myProfile,
    setService,
    setSchedule,
    addServices,
    show

}