import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import asyncWrapper from "../utils/asyncWrapper.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncWrapper( //public function no auth
    async (req, res) => {
        //using cursor pagination here, as it performs better than page skip limit pagination
    let { limit = 5,
            cursor,         // cursor = {"value": ....., "_id": ....}
            query,
            sortBy="views",  //"views or createdAt"
            } = req.query
    
    const defaultQuery ="technology node jwt job dsa placement ml design";
    const searchQuery = query?.trim().toLowerCase() || defaultQuery;
    limit = Number(limit);
    cursor = cursor ? JSON.parse(cursor) : null;
    const stages = {
        isPublished: true,
        $text: {
            $search: searchQuery
        },
    }
    if(cursor){
        if(sortBy==="views"){
            stages.$or = [
                {
                    views: { $lt: (Number(cursor.value)) }
                },
                {
                    views: Number(cursor.value),
                    _id: { $lt: new mongoose.Types.ObjectId(cursor._id)}
                }
            ]
        }else if(sortBy==="createdAt"){
            stages.$or = [
                {
                    createdAt: { $lt: new Date(cursor.value)}
                },
                {
                    createdAt: new Date(cursor.value),
                    _id: { $lt: new mongoose.Types.ObjectId(cursor._id)}
                }
            ]
        }
    }
    const sortStage = sortBy==="views"? {views:-1, _id:-1} : {createdAt:-1, _id:-1};
    let videos = await Video.aggregate([
        {$match: stages},
        {$sort: sortStage},
        {$limit: limit},
        {$lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner"
            }
        },
        {$unwind: "$owner"},
        {$project: {
            _id: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            duration: 1,
            views: 1,
            owner: {
                _id: 1,
                username: 1,
                fullname: 1,
                avatar: 1
            },
            createdAt: 1
        }}
    ]) 
    // console.log(videos,videos.length, "videos length")
    let newCursor = {};
    if(videos.length==0){
        newCursor = null;
    }else{
        newCursor = {
            value: sortBy==="views"? videos[videos.length-1].views : videos[videos.length-1].createdAt ,
            _id: videos[videos.length-1]._id
        }
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, "Videos fetched successfully", { videos, cursor: newCursor})
    )
    }
)

const publishAVideo = asyncWrapper(async (req, res) => { //protected function
    const { title, description, publish} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(publish && publish!="true" && publish!="false"){
        throw new ApiError(400, "publish field can only be true or false")
    }
    if(!title?.trim()){
        throw new ApiError(400, "title is required")
    }
    if(!description?.trim()){
        throw new ApiError(400, "description is required")
    }
    if(!req.files?.videoFile?.[0] || !req.files?.thumbnail?.[0]){
        throw new ApiError(400, "videoFile and thumbnail are required")
    }
    //upload to cloudinary
    const videoFileLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!videoFile || !thumbnail){
        throw new ApiError(500, "Error in uploading files")
    }

    const video = await Video.create(
        {
            videoFile: videoFile.secure_url,
            thumbnail: thumbnail.secure_url,
            title: title.trim(),
            description: description.trim(),
            duration: Number(videoFile.duration.toFixed(2)),
            owner: req.user._id,
            isPublished: publish? publish :true,
        }
    )
    if(!video){
        throw new ApiError(500, "Error in creating video")
    }
    return res.status(201).json(new ApiResponse(201, "Video published successfully", video));
})

const getVideoById = asyncWrapper(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncWrapper(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncWrapper(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncWrapper(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
