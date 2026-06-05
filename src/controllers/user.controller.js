import asyncWrapper from "../utils/asyncWrapper.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
      $or: [{username}, {email}]
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

const loginUser = asyncWrapper(
  async(req,res)=>{

    const {email, username, password} = req.body;

    if(!email && !username){
      throw new ApiError(401,"Email or username required");
    }

    const user = await User.findOne({
      $or:[{username}, {email}]
    })
    if(!user){
      throw new ApiError(401,"user not found");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if(!isPasswordCorrect){
      throw new ApiError(401,"Incorrect password")
    }
    //all credentials are now verified
    //now generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshtoken = refreshToken;
    await user.save({ validateBeforeSave: false })

    const options = {
        httpOnly: true,
        secure: true
    }

    const loggedInUser = user;
    loggedInUser.password=undefined;
    loggedInUser.refreshtoken=undefined;

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
          200, 
          "User logged In Successfully",
          {
            loggedInUser
          }
      )
    )
  }
)

const logoutUser = asyncWrapper(
  async(req,res)=>{

    await User.findByIdAndUpdate(
      req.user._id,
      {refreshtoken: null}
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged Out",{}))
  }
)

const refreshAccessToken = asyncWrapper(
  async function (req,res){
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.headers("Authorization")?.replace("Bearer ","");

    if(!incomingRefreshToken){
      throw new ApiError(401,"unathorized path - refresh token is required")
    }
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decoded._id);
    if(!user){
      throw new ApiError(401,"user not found")
    }
    if(user.refreshtoken !== incomingRefreshToken){
      throw new ApiError(401,"invalid refresh token")
    }

    const newAccessToken = user.generateAccessToken();
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .json(
      new ApiResponse(
          200, 
          "Access token refreshed successfully",
          {
            accessToken: newAccessToken
          }
      )
    )
  }
)

const changePassword = asyncWrapper(
  async function(req,res){
    const {newPassword, oldPassword, confirmPassword}=req.body;
    if(!(newPassword.trim()&&oldPassword.trim()&&confirmPassword.trim())){
      throw new ApiError(401,"All three passwords are required!")
    }
    if(newPassword===oldPassword){
      throw new ApiError(401,"newPassword must be different from old")
    }
    if(newPassword!==confirmPassword){
      throw new ApiError(401,"new and Confirm password must match!")
    }
    const user = await User.findById(req.user._id)
    const isCorrect=await user.isPasswordCorrect(oldPassword);
    if(!isCorrect){
      throw new ApiError(401,"old password incorrect!!")
    }
    user.password=newPassword;
    await user.save({validateBeforeSave:false})

    res
    .status(200)
    .json(new ApiResponse(200,"password changed"))
  }
)

const updateAvatar = asyncWrapper(
  async function(req,res){
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
      throw newApiError(401,"new avatar file for update needed")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if(!avatar){
      throw new ApiError(501,"avatar upload failed")
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: avatar.url
      },
      {new:true}
    ).select("-password -refreshtoken")

    res
    .status(200)
    .json(new ApiResponse(200,"avatar image updated",user))
  }
)

const updateCoverImage = asyncWrapper(
  async function(req,res){
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
      throw newApiError(401,"new coverImage file for update needed")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!coverImage){
      throw new ApiError(501,"coverImage upload failed")
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        coverimage: coverImage.url
      },
      {new:true}
    ).select("-password -refreshtoken")

    res
    .status(200)
    .json(new ApiResponse(200,"coverImage image updated",user))
  }
)

const updateUserDetails = asyncWrapper(
  async function (req,res) {
    let {username, fullname, email} = req.body;
    username = username?.trim().toLowerCase();
    email = email?.trim().toLowerCase();
    fullname = fullname?.trim();
    if(!(username&&fullname&&email)){
      throw new ApiError(401,"all fields are required!")
    }
    const user = await User.findById(req.user._id).select("-password -refreshtoken")

    if(user.username==username&&user.fullname==fullname&&user.email==email){
      //no update needed
      return res.status(200).json(new ApiResponse(200,"No update was seen, operation completed successfully"))
    }

    //check if new usernme or email already exists for some other user
    const existingUser = await User.findOne({
      $or: [{username}, {email}],
      _id: {$ne: req.user._id}
    })

    if(existingUser){
      throw new ApiError(400,"Username or email already exists, try with different ones")
    }

    user.username=username;
    user.fullname=fullname;
    user.email=email;
    user.save({validateBeforeSave:false});

    res.status(200).json(new ApiResponse(200,"User details updated",user))
  }
)

export 
  {registerUser,
   loginUser, 
   logoutUser, 
   refreshAccessToken, 
   changePassword,
   updateAvatar,
   updateCoverImage,
  updateUserDetails
  }