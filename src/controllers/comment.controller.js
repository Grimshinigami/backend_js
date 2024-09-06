import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId || videoId===":videoId"){
        throw new ApiError(400, "Valid videoId is required")
    }

    const options = {
        page,
        limit,
    }

    const allComments = Comment.aggregate([
        {
          $match: {
            video: new mongoose.Types.ObjectId(videoId),
          },
        },
    ])

    const response = await allComments.paginateExec(options)

    if(!response){
        throw new ApiError(500, "Error in fetching comments for video")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, response.docs, "Comments for video fetched successfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if(!content || content?.trim()===""){
        throw new ApiError(400, "Content is required")
    }

    if(!videoId || videoId?.trim()==""){
        throw new ApiError(400, "VideoId is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?.id
    })

    if(!comment){
        throw new ApiError(500, "Some error occurred while adding comment")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, comment, "Comment Added Successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params

    const {content} = req.body

    if(!commentId || commentId===':commentId'){
        throw new ApiError(400, "CommentId is required")
    }

    if(!content || content?.trim()===""){
        throw new ApiError(400, "Valid content is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404, "Couldn't find the comment")
    }

    comment.content = content

    comment.save()

    return res
            .status(200)
            .json(new ApiResponse(200, comment, "Updated comment successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if(!commentId || commentId===':commentId'){
        throw new ApiError(400, "CommentId is required")
    }

    const comment = await Comment.deleteOne({_id: commentId})

    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, comment, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
