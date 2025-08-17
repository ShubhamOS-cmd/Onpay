import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLDNRY_USER_NAME, 
    api_key: process.env.CLDNRY_API_KEY, 
    api_secret: process.env.CLDNRY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
    // this localfilepath comes from when user upload the files of pic it's temp on our server locals then in regester function we send this localpath of temp to cloudnary
    try {
        if(!localFilePath){
            return null; 
        }
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: "auto"
        })

        console.log("file is upload on cloudinary " , response.url);
        fs.unlinkSync(localFilePath); // after succesfully upload unlync the file means delete that 
        //console.log(response);
        return response.url;
        
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export { uploadOnCloudinary}