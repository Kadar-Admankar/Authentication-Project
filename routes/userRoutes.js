import express from 'express';
const router = express.Router()
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth.middleware.js'

//Route Level Middleware - To Protect Route
router.use(`/changepassword`, checkUserAuth)
router.use(`/loggeduser`, checkUserAuth)

//Public Routes - available without any password/ authorization
router.post(`/register`, UserController.userRegistration)
router.post(`/login`, UserController.userLogin)
router.post(`/send-reset-password-email`, UserController.sendUserPasswordResetEmail) //link will be sent
router.post(`/reset-password/:id/:token`, UserController.userPasswordReset) //chnaging password as forgot password

//Protected/Private route - need password or authentication
router.post(`/changepassword`, UserController.changeUserPassword)  //here user changing password to new password as already knows old password
router.get(`/loggeduser`, UserController.loggedUser)

export default router;