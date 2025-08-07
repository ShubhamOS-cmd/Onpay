const asyncHandler = (reqhandler) => {
    return (req , res , next) => {
        Promise.resolve(reqhandler(req , res , next)).catch((error) => next(error))
    }
}

export {asyncHandler}