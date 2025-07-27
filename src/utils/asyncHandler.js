const asyncHandler = (requestHandler) => {
    return (req , res , next) => {
        Promise.resolve(requestHandler(req , res , next)).catch((error)=>(error))
    }
}


export {asyncHandler}