import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import asyncWrapper from "../utils/asyncWrapper.js"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncWrapper(
  async function (req,res,next){

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    if(!token){
      throw new ApiError(401,"anauthorized path")
    }
    const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decoded?._id).select("-password -refreshtoken")
    if(!user){
      throw new ApiError(401,"auth: user not found")
    }

    req.user = user;
    return next();
  }
)