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
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}