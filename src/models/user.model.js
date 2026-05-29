import mongoose from "mongoose"
import bcrypt from  "bcrypt"

const UserSchema= new moongoose.Schema(
  {
    username:{
      type:String,
      required:true,
      lowercase:true,
      unique:true,
      trim:true,
      index:true,
    },
    email:{
      type:String,
      required:true,
      lowercase:true,
      trim:true,
      unique:true
    },
    fullname:{
      type:String,
      required:true,
      trim:true,
      index:true
    },
    avatar:{
      type:String
    },
    coverimage:{
      type:String
    },
    password:{
      type: String,
      required: [true,"password is required!!"]
    },
    watchhistory:{
      type: Array(
      {
        type:mongoose.Schema.types.ObjectId,
        ref:"Video"
      }
      )
    },
    refreshtoken:{
      type:String
    }
  },{timestamps:true}
)

UserSchema.pre("save", async function(next){
  if(!this.isModified("password"))return next();

  this.password=await bcrypt.hash(this.password,10);
  next();
})

UserSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password,this.password); //true or false 
}
//accesstoken kee expiry is less, i am not storing it in the userschema
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
//refresh token expiry is more, i am storing it in the schema.
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=moongoose.model("User",UserSchema);

