import UserModel from "../models/User.js";
import bcrypt from "bcrypt"; //for password hashing
import jwt from "jsonwebtoken";
import transport from "../config/emailConfig.js";

//The req. body object allows you to access data in a string or JSON object from the client side. You generally use the req. body object to receive data through POST and PUT requests in the Express server.

class UserController {
  static userRegistration = async (req, res) => {
    const { name, email, password, password_confirmation, tc } = req.body;
    const user = await UserModel.findOne({ email: email }); //first email is already existed and second email entered by new user for registration
    console.log(user)
    if (user) {
      res.send({ status: "failed", message: "email already existed" });
    } else {
      if (name && email && password && password_confirmation && tc) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10); 
            //the max no. you give that much the password will be secured
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name, //first name is from schema and second is from user creating/ giving name
              email: email, // here you can give single name, email, password and tc instead of two times
              password: hashPassword,
              tc: tc,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            //Generate JWT
            const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" } );
            res.status(201).send({ status: "success", message: "Registration Successful", token: token, });
          } catch (error) {
            console.log(error); // this is only for development purpose
            res.send({ status: "failed", message: "Unable to Register" }); // this is production ready response
          }
        } else {
          res.send({
            status: "failed",
            message: "password and confirm password does not matched",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fileds are required" });
      }
    }
  };
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        console.log(user)
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password); //first pmtr password user entering and second pmtr we are getting from database
          if (user.email === email && isMatch) {
            //Generate JWT Token
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" } );
            res.send({ status: "success", message: "Login Successful", token: token });
          } else {
            res.send({
              status: "failed",
              message: "email or password is invalid",
            });
          }
        } else {
          res.send({
            status: "failed",
            message: "You are not a Registered User",
          });
        }
      } else {
        res.send({ status: "failed", message: "All fileds are required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Unable to Login" });
    }
  };

  static changeUserPassword = async(req,res)=>{
    const { password, password_confirmation } = req.body
    if(password && password_confirmation){
          if(password !== password_confirmation){
            res.send({ status: "failed", message: "New password and confirm New password doesnt match" });
          }else{
            const salt = await bcrypt.genSalt(10)
            const newHashPassword = await bcrypt.hash(password, salt)
            await UserModel.findByIdAndUpdate(req.user._id, { $set:{ password:newHashPassword } })
            console.log(req.user)
            res.send({ status: "Success", message: "Password changed successfully" });
          }
    }else{
      res.send({ status: "failed", message: "All fields are required" });
    }
  }

  static loggedUser = async (req,res)=>{
    res.send({ "user": req.user })
  }

  static sendUserPasswordResetEmail = async (req,res)=>{
    const { email } = req.body
    if(email){
        const user = await UserModel.findOne({ email: email })
        
        if(user){
            const secret = user._id + process.env.JWT_SECRET_KEY
            const token = jwt.sign({ userID:user._id }, secret, { expiresIn:'15m' })
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
            console.log(link)
          //Send Mail
          let info = await transport.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: `Geekshop - Password Reset Link`,
            html: `<a href=${link}>Click Here</a> to reset your password`
          })

            res.send({ status: "success", message: "Password Reset Email Sent...Please Check Your Email", info:"info" });
        }else{ 
          res.send({ status: "failed", message: "Email doesnt exists" });
        }
    }else{
      res.send({ status: "failed", message: " Email field is required " });
    }
  }

    static userPasswordReset = async (req,res)=>{
      const { password, password_confirmation } = req.body
      const { id, token } = req.params
      const user = await UserModel.findById(id)
      const new_secret = user._id + process.env.JWT_SECRET_KEY
      try {
        jwt.verify(token, new_secret)
        if( password && password_confirmation){
           if( password !== password_confirmation){
            res.send({ status: "failed", message: " New Password and confirm password doesnt match " });
           }else{
            const salt = await bcrypt.genSalt(10)
            const newHashPassword = await bcrypt.hash(password, salt)
            await UserModel.findByIdAndUpdate( user._id, { $set: {password: newHashPassword }})
            res.send({ status: "success", message: " Password Reset Successfully " });
           }
        }else{
          res.send({ status: "failed", message: " All fields are required " });
        }
      } catch (error) {
        console.log(error)
        res.send({ status: "failed", message: " Invalid Token " });
      }
    }
}

export default UserController;
