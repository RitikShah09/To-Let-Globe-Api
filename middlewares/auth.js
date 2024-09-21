const jwt = require("jsonwebtoken");

const ErrorHandler = require("../utils/errorHandler");
const { catchAsyncErrors } = require("./catchAsyncErrors");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log(req.cookies)
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("Please Login To Access The Resources", 401));
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.id = id;
    next();
})
