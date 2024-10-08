exports.sendToken = (user, statusCode, res) => {
  const token = user.getJwtoken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: true, // Use HTTPS in production
    sameSite: 'None', // Required for cross-origin cookies
   path: "/"
  };

  res
    .status(statusCode)
    .cookie("token", token, options) // Setting the token in the cookie
    .json({ success: true, id: user._id, token });
};
