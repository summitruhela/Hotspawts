const bcrypt = require('bcryptjs')
const mailer = require('nodemailer')
const jwt = require('jsonwebtoken')
// const config = require('../config/config-dev.js')
const config = require('../config/config.dev')
const config_json = require('../config/config.json')
const cloudinary = require('cloudinary')
const async = require('async')
let speakEasy = require('speakeasy');
var NodeGeocoder = require('node-geocoder');
var crypto = require('crypto');
const twilio = require("twilio");
var algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

let transporter;
cloudinary.config({
    cloud_name: "sumit9211",
    api_key: "885582783668825",
    api_secret: "0dT6FoxdcGb7UjTKtUGQbAVdOJI"
});
const accountSid = 'AC70d02cf2c76d11ff4e6c0f3e9ecfb923';
const authToken = '052a59ef85f9fec4aa0f8c7dd46886bb';
// const client = require('twilio')(accountSid, authToken);
let secret = speakEasy.generateSecret({
    length: 20
});
let salt = bcrypt.genSaltSync(10)
// nodemailer.createTestAccount((err, account) => { 
//     if (err) {
//         console.log("Account could not be created", err)
//     }
//     transporter = nodemailer.createTransport({
//         host: account.smtp.host,
//         port: account.smtp.port,
//         secure: account.smtp.secure,
//         auth: {
//             user: account.user,
//             pass: account.pass
//         }
//     })
// })
var groomer_schema = require('../dbSchema/groomerModel/signup_groomer')
var customer_schema = require('../dbSchema/customerModel/signupSchema')
module.exports = {

    responseHandler: (res, responseCode, responseMessage, data, token) => {
        res.send({
            responseCode: responseCode,
            responseMessage: responseMessage,
            data: data,
            token: token
        })
    },
    createHash: (password, callback) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err)
                callback(err, null)
            else
                callback(null, hash)
        })
    },
    compareHash: (password, storedHash, callback) => {
        bcrypt.compare(password, storedHash, (err, result) => {
            if (err)
                callback(null)
            else
                callback(result)
        })
    },
    sendEmail: (email, subject, message, link, cc, bcc, callback) => {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vaibhavdrichierich@gmail.com',
                pass: 'vaibhav777'
            }
        })
        // console.log(message,"\n",link)
        let messageObj = {
            from: 'Noreply<vaibhavdrichierich@gmail.com>',
            to: email,
            subject: subject,
            text: message, //"A sentence just to check the nodemailer",
            html: link, //"Click on this link to <a href=" + link + ">reset Password</a>",
            cc: cc,
            bcc: bcc
        }
        transporter.sendMail(messageObj, (err, info) => {
            if (err) {
                console.log("Error occured", err)
                callback(null);
            } else {
                console.log("Mail sent")
                callback("Mail sent.")
            }
        })
    },

    jwtDecode: (token, callback) => {
        console.log("jwt")
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                callback(null)
                console.log(err)
            } else {
                console.log("$$$$$$$",decoded.id)
                callback(null,decoded.id)
            }
        })
    },

    jwtEncode: (auth) => {
        console.log("token generate")
        var token = jwt.sign({ id: auth }, config.secret, { expiresIn: 86400 })
        return token;
    },
    imageUploadToCloudinary: (imageB64, callback) => {
        // console.log(imageB64)
        return cloudinary.v2.uploader.upload(imageB64, (err, result) => {
          //  console.log("fddfdfgfg", result);
            callback(null, result.url);
        })
    },

    uploadMultipleImages: (imagesB64, callback) => {
        let a = [];
        // console.log("uploadMultipleImages",imagesB64);
        async.eachSeries(imagesB64, (item, callbackNextIteratn) => {
            module.exports.imageUploadToCloudinary(item, (err, url) => {
                if (err) throw err
                else {
                 a.push(url);
                     //console.log("#############",a);
                    // console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", url)
                    callbackNextIteratn();
                    // console.log("%%%%%%%%%%%",a);
                }
            })
        }, (err) => {
            // console.log("aaaaaassasdsssssssssss",a)
            console.log("Done with async loop")
            callback(null,a);       

        })
        // console.log("----------result of multi image uploader--------->>>", a);
    },

    generateOTP: (callback) => {
        let secret = speakEasy.generateSecret({
            length: 20
        });
        console.log("secret======>>>>>>" + JSON.stringify(secret))
        // let token = speakEasy.totp({
        //     secret: secret.base32,
        //     encoding: 'base32'
        // })
        let token = 123456;
        callback(token, secret);
    },

    sendText: (number, otp, callback) => {
        console.log(number, "====>>>", typeof (number))
        client.messages
            .create({
                to: number,
                from: "+19513192317",
                // from: "+19783064180", 
                // from: "+14132695276", 
                body: 'Your one-time password for Tap Culture is' + otp,
            })
            .then((message) => {
                console.log("space", message.sid)
                callback(message.sid);
            }, (err) => {
                console.log(err);
                callback(null);
            });
    },

    verifyOTP: (otp, secret, callback) => {
        let tokenValidates = speakEasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: otp,
            window: 10 //implies that 10==5 min @default step=30s
            // step: 1
        });
        console.log("tokenValidates", tokenValidates)
        callback(tokenValidates);
    },

    getLatLong: (place, callback) => {
        let fn, temp;
        var options = {
            provider: 'google',
            // Optional depending on the providers
            // httpAdapter: 'https', // Default
            apiKey: 'AIzaSyB959XY2RqlTkZNYuNRp1EU_YiA3KjS71Q' // for Mapquest, OpenCage, Google Premier
            // formatter: null         // 'gpx', 'string', ...
        };
        var geocoder = NodeGeocoder(options);
        // fn = () => {
        geocoder.geocode(place, function (err, result) {
            // console.log(err, result);
            if (result) {
                callback(result[0].latitude, result[0].longitude)
            }
        });
        // }
        // if(fn()){
        //     console.log("if",temp)
        //     callback(temp[0].latitude, temp[0].longitude)
        // }else{
        //     console.log("else")
        //     fn();
        // }
    },

    getPlace: (place, callback) => {
        console.log("place callback------------>", place)
        console.log(place[0])
        var para = {
            lat: place[1],
            lon: place[0]
        }
        console.log(para)
        let fn, temp;
        var options = {
            provider: 'google',
            // Optional depending on the providers
            // httpAdapter: 'https', // Default
            apiKey: 'AIzaSyB959XY2RqlTkZNYuNRp1EU_YiA3KjS71Q' // for Mapquest, OpenCage, Google Premier
            // formatter: null         // 'gpx', 'string', ...
        };
        var geocoder = NodeGeocoder(options);
        // fn = () => {
        geocoder.reverse(para, function (err, result) {
            console.log("place is ---------->>", result)
            // console.log(err, result);
            if (result) {
                callback(result)
            }
        });
        // }
        // if(fn()){
        //     console.log("if",temp)
        //     callback(temp[0].latitude, temp[0].longitude)
        // }else{
        //     console.log("else")
        //     fn();
        // }
    },
    //encrypted
    encrypt: (text) => {
        var cipher = crypto.createCipher(algorithm, password);
        var crypted = cipher.update(text, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;

    },
    //decrypt
    decrypt(text) {
        var decipher = crypto.createDecipher(algorithm, password)
        var dec = decipher.update(text, 'hex', 'utf8')
        dec += decipher.final('utf8');
        return dec;
    },

    // verifyToken: (req, res, next) => {
    //     // var token = req.headers.token ;
    //     // console.log("header>>>>>>>" + req.headers._id + " token is >>>>>>" + req.headers.token)
    //     if (req.headers.token) {
    //         console.log("secret key is " + config.secret)
    //         jwt.verify(req.headers.token, config.secret, (err,result) => {
    //             if (err) {
    //                 console.log("token not verified", err)
    //                 // Response.sendResponseWithoutData(res, resCode.UNAUTHORIZED, "Authentication failed.")
    //                 res.send({
    //                     resCode: 404,
    //                     resMessage: "UNAUTHORIZED",
    //                     ERROR: err
    //                 })
    //             } else {
    //                 console.log("%%%%%%%%",result)
    //                 console.log("token verified")
    //                 customer_schema.findOne({ _id: result.id }, (error, result) => {
    //                     console.log("result of user " + JSON.stringify(result))
    //                     if (error) {
    //                         // Response.sendResponseWithoutData(res, resCode.WENT_WRONG, resMessage.WENT_WRONG)
    //                         res.send(error)

    //                     }
    //                     else if (!result) {
    //                         console.log("null user entered")
    //                         // console.log(decoded)
    //                         res.send({ result: result, resmsg: "null" })
    //                     } else {
    //                         next();
    //                         //Response.sendResponseWithData(res,resCode.EVERYTHING_IS_OK,"Verify_Successfully",result)
    //                     }
    //                 })
    //             }
    //         })
    //     } else {
    //             res.send({rescode:404,resMessage:"No token provided"})        
    //         // Response.sendResponseWithoutData(res, 403, "No token provided.")
    //     }

    // },

    //nodemailer

    sendMail: (email, subject, text, callback) => {

        const mailBody = {
            from: "<do_not_reply@gmail.com>",
            to: email,
            subject: subject,
            html: "http://127.0.0.1:3000/?token=" + text
            // html: "<p>Your verification code is " + otp + "</p>"
        };

        mailer.createTransport({
            service: 'GMAIL',
            auth: {
                user: config_json.nodemailer.user,
                pass: config_json.nodemailer.pass
            },
            port: 587,
            host: 'smtp.gmail.com'

        }).sendMail(mailBody, callback)
    },

    sendSMS: (message, number, callback) => {
        let client = new twilio(config_json.twilio.sid, config_json.twilio.auth_token);
        client.messages.create({
            body: message,
            to: "+91" + number, // Text this number
            from: config_json.twilio.number // From a valid Twilio number
        })
            .then((message) => {
                callback(null, message.sid);
            })
            .catch((response) => {
                callback(response);
            })
    },

    getOTP: () => {
        var val = Math.floor(1000 + Math.random() * 9000);
        console.log("value==>>", val);
        return val;
        //  speakeasy.totp({
        //     secret: config.speakeasy.secret_key,
        //     digits: 4
        // })
    },
    //function to upload image
    uploadImg: (base64, callback) => {
        cloudinary.uploader.upload(base64, (result1) => {
            console.log("=====================", result1);
            if (result1.secure_url) {
                callback(null, result1.secure_url)
            }
            else {
                callback(true, null);
            }
        })
    },
    upload_image :async(req, res) =>{
        // res_promises will be an array of promises
        let res_promises = req.files.map(file => new Promise((resolve, reject) => {
            cloudinary.v2.uploader.upload(file.path, { use_filename: true, unique_filename: false }, function (error, result) {
                if(error) reject(error)
                else resolve(result.public_id)
            })
        })
        )
        // Promise.all will fire when all promises are resolved 
        Promise.all(res_promises)
        .then(result =>  res.json({'response':upload}))
        .catch((error) => {/*  handle error */ })
    }

    // var apn = require('apn');
    //   push_notification = function(deviceToken,message){
    // var options = {
    //   "cert": config.pemFile,
    //   "key":  config.pemFile,
    //   "passphrase": "Mobiloitte1",

    //   "gateway": "gateway.push.apple.com",
    //   "port": 2195,
    //   "enhanced": true,
    //   "cacheLength": 5,
    //   "title":"Bean There",
    //   "message":"Hello from Bean There. Here is a message for you!!",
    // };
    // var title="Bean There";
    // var message= message;
    // var apnConnection = new apn.Connection(options);
    // var myDevice = new apn.Device(deviceToken);
    // var note = new apn.Notification();

    //   //note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    //   note.badge = 1;
    //   note.alert = message;
    //   note.payload = {"title":title,"message":message};
    //   try{
    //     apnConnection.pushNotification(note, myDevice);
    //     console.log('iOS Push Notification send');
    //     return true;
    //   } catch(ex){
    //     console.log("Error in push notification-- ",ex);
    //     return false;
    //   }
    // }

    // imageUploadToCloudinary1:(imageUrl)=>{
    //     console.log("Control was here")
    //     cloudinary.v2.uploader.upload(imageUrl,(err,result)=>{
    //         console.log("cloudinary function",result,err);
    //         return result.url;
    //     })
    // }
}
