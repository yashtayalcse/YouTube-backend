import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
  {
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video'
      }
    ],
    username: {
      type: String,
      required: [true, 'Username required'],
      unique: [true, 'Username already exists'],
      trim: true,
      lowercase: true,
      index: true, //only for thpse fields where you want searching
    },
    email: {
      type: String,
      required: [true, 'Email required'],
      unique: [true, 'Email already exists'],
      trim: true,
      lowercase: true,
    },
    fullname:{
      type: String,
      required: [true, 'Fullname required'],
      trim: true,
    },
    avatar: {
      type: String
    },
    coverImage: {
      type: String
    },
    password: {
      type: String,
      required: [true, 'Password required'],
      unique: [true, 'Password exists']
    },
    refreshToken: {
      
    }
  }, { timestamps: true }
);

//Encyrpt password before saving in db, if modified
userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
} )

// It returns true or false
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
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

export const User = mongoose.model('User', userSchema);
