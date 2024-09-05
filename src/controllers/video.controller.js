import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = '1', userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if(!userId){
        throw new ApiError(400, "UserId is required")
    }

    const currentUserVideos = Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(userId),
          },
        },
      ])

      if(!currentUserVideos){
        throw new ApiError(400,'User not found')
      }
      

      const options = {
        page,
        limit,
        sort: {[sortBy]: Number(sortType)}
      }

    //   console.log(currentUserVideos);
    
    const response = await currentUserVideos.paginateExec(options)
    
    // console.log(response);
    

    if(!response){
        throw new ApiError(500, "Something went wrong")
    }

    return res
            .status(200)
            .json(new ApiResponse(200,response.docs,"Videos Posted by user"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if([title, description].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const videoFilePath = req.files?.videoFile[0].path

    if(!videoFilePath){
        throw new ApiError(400, "Video File is required")
    }

    let thumbnailPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length>0){
        thumbnailPath = req.files?.thumbnail[0]?.path;
    }

    const videoFile = await uploadOnCloudinary(videoFilePath)
    const thumbNail = await uploadOnCloudinary(thumbnailPath)

    // console.log(videoFile);
    

    if(!videoFile){
        throw new ApiError(500, "Something went wrong")
    }

    // throw new ApiError(500, "Something went wrong")


    const video = await Video.create({
        videoFile: videoFile?.secure_url,
        thumbnail: thumbNail?.secure_url || "",
        title,
        description,
        duration: videoFile.duration,
        views: 0,
        isPublished: false,
        owner: req.user?._id
    })

    if(!video){
        throw new ApiError(500, "Something went wrong while uploading video")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Video Uploaded succesfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId){
        throw new ApiError(401, "Video id is required")
    }
    
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found or invalid id")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Video Found Successfully"))

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    const {title, description} =  req.body

    const thumbnailPath = req.file?.path

    // console.log(thumbnailPath);
    

    if(title.trim()==="" && description.trim()==="" && thumbnailPath===''){
        throw new ApiError(400, "At least one field is required")
    }
    

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video not found")
    }
    
    if(title?.trim()!==""){
        video.title = title
    }

    if(description?.trim()!==""){
        video.description = description
    }
    if(thumbnailPath!==undefined){
        const thumbnail = await uploadOnCloudinary(thumbnailPath)

        // console.log(thumbnail);      

        if(!thumbnail){
            throw new ApiError(401, "Error uploading thumbnail")
        }

        // console.log(thumbnail)

        video.thumbnail = thumbnail?.url

    }

    await video.save()
    
    return res
            .status(200)
            .json(new ApiResponse(200, video, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    // console.log(video);
    
    // throw new ApiError(500, "Internal Server Error")

    const deletedVideo = await deleteFromCloudinary(video.videoFile,'video')

    // console.log(deletedVideo);
    
    if(!deletedVideo){
        throw new ApiError(500, "Error deleting video")
    }
    
    const deletedThumbnail = await deleteFromCloudinary(video.thumbnail)

    // console.log(deletedThumbnail);
    
    if(!deletedThumbnail){
        throw new ApiError(500, "Error deleting thumbnail")
    }

    const deletedObj = await Video.findByIdAndDelete(videoId);

    // console.log(deletedObj)

    if(!deletedObj){
        throw new ApiError(500, "Error in deleting Video")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, deletedObj, "Video Deleted Successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Video not found")
    }

    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(501, "Couldn't toggle publish status")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res
            .status(200)
            .json(new ApiResponse(200, video, "Publish Status updated successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
