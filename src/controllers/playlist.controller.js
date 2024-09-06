import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name="", description, videoId} = req.body

    //TODO: create playlist

    if(!name){
        throw new ApiError(400, "Video name is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(videoId){
        playlist.videos.push(videoId)
        await playlist.save()
    }
    
    if(!playlist){
        throw new ApiError(500, "Some error occured while creating playlist")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist created successfully"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!userId || userId===":userId"){
        throw new ApiError(400, "Valid userId required")
    }

    const playlist = await Playlist.find({owner: userId})

    if(!playlist){
        throw new ApiError(404, "User not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "User Playlists fetched successfully"))

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(400, "playlistId is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(500, "Playlist not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Fetched playlist successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || playlistId===":playlistId"){
        throw new ApiError(400, "Valid playlistId required")
    }

    if(!videoId || videoId===":videoId"){
        throw new ApiError(400, "Valid videoId required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Video added to playlist successfully"))

    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!playlistId || playlistId===":playlistId"){
        throw new ApiError(400, "Valid playlistId required")
    }

    if(!videoId || videoId===":videoId"){
        throw new ApiError(400, "Valid videoId required")
    }

    const playlist = await Playlist.updateOne(
        {_id: playlistId},
        {$pull: {"videos": videoId}}
    )

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Video Deleted Successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!playlistId || playlistId===":playlistId"){
        throw new ApiError(400, "Valid playlistId required")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    // console.log(deletedPlaylist);
    

    if(!deletedPlaylist){
        throw new ApiError(404, "Couldn't find Playlist")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId || playlistId===":playlistId"){
        throw new ApiError(400, "Valid playlistId required")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    if(name){
        playlist.name = name
        await playlist.save()
    }

    if(description){
        playlist.description = description
        await playlist.save()
    }

    return res
            .status(200)
            .json(new ApiResponse(200, playlist, "Playlist updated successfully"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
