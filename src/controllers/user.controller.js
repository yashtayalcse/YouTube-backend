import asyncWrapper from "../utils/asyncWrapper.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncWrapper( 
  async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    
    const {username,email,fullname,password} = req.body;
    
    const arr=[username, email, fullname, password];
    const isEmpty = arr.some(field=> field.trim()==="");
    if (isEmpty){
      throw new ApiError(400, "Field is required!")
    }

    const userFound = await User.findOne({
      $or: [{username, email}]
    });

    if(userFound){
      throw new ApiError(400,"User already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverimageLocalPath = req.files?.coverimage?.[0]?.path;

    if(!avatarLocalPath){
      throw new ApiError(400, "Avatar is required!!");
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath);
    const coverimage=await uploadOnCloudinary(coverimageLocalPath);

    const user = await User.create(
      {
        username,
        email,
        fullname,
        password,
        avatar: avatar.url,
        coverimage: coverimage?.url || ""
      }
    );

    const createdUser = await User.findById(user._id).select("-password -refreshtoken");

    if(!createdUser){
      throw new ApiError(500,"Something went wrong while registering the user");
    }

    return res.status(200).json(
      new ApiResponse(200,createdUser)
    );
  }
)

export {registerUser}