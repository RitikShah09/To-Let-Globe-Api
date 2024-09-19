exports.sendToken = (user, statusCode, res) => {
  const token = user.getJwtoken();
const domain = process.env.CLIENT_URL.replace(/^https?:\/\//, "");

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Cookie can't be accessed by client-side JavaScript
    secure: process.env.NODE_ENV === "production", // Cookie only sent over HTTPS in production
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Allow cross-origin requests in production
    domain: process.env.NODE_ENV === "production" ?  'to-let-globe-client.vercel.app' : "localhost" // Specify domain for production
  };

  res
    .status(statusCode)
    .cookie("token", token, options) // Setting the token in the cookie
    .json({ success: true, id: user._id, token });
};
