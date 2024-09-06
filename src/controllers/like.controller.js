import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!videoId || videoId===":videoId"){
        throw new ApiError(400, "Video Id is required")
    }

    const checkliked = await Like.findOne({video: videoId})

    if(!checkliked){
        const likevideo = await Like.create({
            video: videoId,
            likedBy: req.user?._id
        })

        if(!likevideo){
            throw new ApiError(500, "Something went wrong while liking video")
        }

        return res
                .status(200)
                .json(new ApiResponse(200, likevideo, "Video Liked successfully"))

    }

    const deleteLike = await Like.deleteOne({video: videoId, likedBy: req.user?._id})

    if(!deleteLike){
        throw new ApiError(500, "Something went wrong while deleting like from video")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, deleteLike, "Like deleted successfully"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId || commentId===":commentId"){
        throw new ApiError(400, "Valid commentId required")
    }

    const checkliked = await Like.findOne({comment: commentId})

    if(!checkliked){
        const likedcomment = await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        })

        if(!likedcomment){
            throw new ApiError(500, "Something went wrong while liking comment")
        }

        return res
                .status(200)
                .json(new ApiResponse(200, likedcomment, "Comment Liked successfully"))

    }

    const deleteLike = await Like.deleteOne({comment: commentId, likedBy: req.user?._id})

    if(!deleteLike){
        throw new ApiError(500, "Something went wrong while deleting like from comment")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, deleteLike, "Like deleted successfully"))


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!tweetId || tweetId===":tweetId"){
        throw new ApiError(400, "Valid tweetId required")
    }

    const checkliked = await Like.findOne({tweet: tweetId})

    if(!checkliked){
        const likedTweet = await Like.create({
            tweet: tweetId,
            likedBy: req.user?._id
        })

        if(!likedTweet){
            throw new ApiError(500, "Something went wrong while liking tweet")
        }

        return res
                .status(200)
                .json(new ApiResponse(200, likedTweet, "Tweet Liked successfully"))

    }

    const deletedLike = await Like.deleteOne({tweet: tweetId, likedBy: req.user?._id})

    if(!deletedLike){
        throw new ApiError(500, "Something went wrong while deleting like from tweet")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, deletedLike, "Like deleted successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const {page = 1, limit = 10} = req.query

    const likedVideos = Like.aggregate([
        {
          $match: {
            likedBy: new mongoose.Types.ObjectId(req.user?._id)
          },
        },
    ])

    const options = {
        page,
        limit,
      }

    const response = await likedVideos.paginateExec(options)

    if(!response){
        throw new ApiError(500, "Some error occured while fetching liked videos")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, response.docs, "Liked videos fetched successfully"))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}