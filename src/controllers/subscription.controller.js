import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    

    if(!channelId){
        throw new ApiError(400,"Channel Id is required")
    }

    const user = req.user

    if(channelId===user?._id?.toString()){
        throw new ApiError(400, "User cannot subscribe or remove subscription for himself")
    }

    const Subscribed = await Subscription.find({subscriber: user, channel: channelId})

    if(Subscribed.length==0){

        // console.log(Subscribed);
        
        const Subscriber = await Subscription.create({
            subscriber: user?._id,
            channel: channelId
        })

        if(!Subscriber){
            throw new ApiError(501, "Internal Server Error")
        }

        return res
                .status(200)
                .json(new ApiResponse(200, Subscriber, "Subscription Added"))
    }

    const deleted = await Subscription.deleteOne({subscriber: user, channel: channelId})

    if(!deleted){
        throw new ApiError(500, "Error in deleting subscription")
    }

    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Subscription Removed Successfully"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const {page=1, limit=10,} = req.query

    if(!channelId){
        throw new ApiError(400, "ChannelId is required")
    }

    const subscribers = Subscription.aggregate([
        {
          $match:
            {
              channel: new mongoose.Types.ObjectId(channelId),
            },
        },
    ])

    const options = {
        page,
        limit,
    }

    const response = await subscribers.paginateExec(options)

    if(!response){
        throw new ApiError(400,"Channel not found")
    }

    // console.log(response);
    

    return res
            .status(200)
            .json(new ApiResponse(200, response.docs, "Subscribers for the channel"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {

    const {page=1, limit=10,} = req.query

    const options = {
        page,
        limit,
    }

    const channels = Subscription.aggregate([
        {
          $match:
            {
              subscriber: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
    ])

    const response = await channels.paginateExec(options)

    if(!response){
        throw new ApiError(500,"Something went wrong")
    }

    // console.log(response);
    
    return res
            .status(200)
            .json(new ApiResponse(200, response.docs, "Channels user is subscribed to"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}