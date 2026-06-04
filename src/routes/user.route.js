import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router=Router();

router.route("/register").post(

  upload.fields([
    {name: "avatar", maxCount:1},
    {name: "coverimage", maxCount:1},
  ])
  
  ,registerUser) // http://localhost:8000/api/v1/users/register

router.route("/login").post(loginUser) // http://localhost:8000/api/v1/users/login

router.route("/logout").post(verifyJWT, logoutUser)

export default router;