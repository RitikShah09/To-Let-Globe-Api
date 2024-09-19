const express = require("express");
const app = express();
require("dotenv").config({ path: "./.env" });

require("./models/database").connectDatabase();
const cors = require("cors");
app.use(
  cors({
    origin: "https://to-let-globe-client.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

const logger = require("morgan");
const ErrorHandler = require("./utils/errorHandler");
const { generatedErrors } = require("./middlewares/errors");

app.use(logger("tiny"));

app.use(express.urlencoded({ extended: false }));

const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);

app.use(cookieParser());

const fileUpload = require("express-fileupload");
app.use(fileUpload());

app.use("/", require("./routes/userRoutes"));

app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Requested URL Not Found}`, 404));
});

app.use(generatedErrors);

app.listen(
  process.env.PORT,
  console.log(`Server is Running  on PORT ${process.env.PORT}`)
);
