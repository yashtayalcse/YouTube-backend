import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncWrapper from "../utils/asyncWrapper.js"
    
const createTweet = asyncWrapper(async (req, res) => {
    //TODO: create tweet
})

const getUserTweets = asyncWrapper(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncWrapper(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncWrapper(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
