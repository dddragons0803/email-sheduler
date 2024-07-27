const {constants} = require("../constants");
const errorHandler=(err,req,res,next) => {
const statusCode =  res.statusCode ? res.statusCode : 500;
switch(statusCode)
{
   case constants.VALIDATION_ERROR:
        res.json({
        title:"validation failded",
        message:err.message,
        stackTrace:err.stack})
        break;
    case constants.NOT_FOUND:
        res.json({
        title:"notfound",
        message:err.message,
        stackTrace:err.stack})
        break;
    case constants.UNAUTHORIZED:
        res.json({
        title:"unauthorised",
        message:err.message,
        stackTrace:err.stack})
        break;
    case constants.SERVER_ERROR:
        res.json({
        title:"server errr",
        message:err.message,
        stackTrace:err.stack})
        break;
    case constants.FORBIDDEN:
        res.json({
        title:"forbidden",
        message:err.message,
        stackTrace:err.stack})
    default:
        console.log("No error, all good")
        break;
}


};
module.exports= errorHandler;