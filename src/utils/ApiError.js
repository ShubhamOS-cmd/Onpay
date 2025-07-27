// this is an api Error file we used when we send some error response 
class ApiError extends Error{
    constructor(
        statusCode ,
        message = "Something went wrong!",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = false;
        this.success = errors
        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this , this.constructor)
        }
    }
}

export {ApiError}