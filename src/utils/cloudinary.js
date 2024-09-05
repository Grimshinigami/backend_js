import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath)
            return null
        //Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })

        // console.log(response)

        // console.log("File is uploaded on cloudinary", response.url)
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation failed
        return null;       
    }
}

const deleteFromCloudinary = async(cloudinaryPath, filetype="image") => {
    try {
        let public_id = ""
        for(let i = cloudinaryPath.length-1;i>=0;--i)
        {
            if(cloudinaryPath[i]!='/')
                public_id+=cloudinaryPath[i]
            else
                break;
        }
        
        public_id = public_id.split("").reverse().join("");
        

        while(public_id[public_id.length-1]!='.'){
            public_id = public_id.slice(0, -1);
        }
        public_id = public_id.slice(0, -1);

        // console.log("Image public id: ",public_id)

        const response = await cloudinary.api.delete_resources(
            [public_id],
            { type: 'upload', resource_type: filetype }
        )

        // console.log(response)

        return response


    } catch (error) {
        console.log("Error: ",error)
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}