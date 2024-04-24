require('dotenv').config();
const multer = require('multer');
const upload = multer();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require('body-parser');
const studentRouter = require("./routes/student");
const adminRouter = require("./routes/admin");
const courseRouter = require("./routes/course");
const postRouter = require("./routes/post");
const professorRouter = require("./routes/professor");
const userLoginRouter = require("./routes/userLogin");
const attendanceRouter = require("./routes/markAttendance");
const viewAttendanceRouter = require("./routes/viewAttendance");
const resultRouter = require("./routes/results");
const todoRouter = require("./routes/todo");
// const bcrypt = require('bcrypt');
app.use(cors());

const PORT = process.env.PORT || 5000;


app.use(bodyParser.json());
app.use("/student",studentRouter);
app.use("/admin",adminRouter);
app.use("/course",courseRouter);
app.use("/post",postRouter);
app.use("/professor",professorRouter);
app.use("/user",userLoginRouter)
app.use("/markAttendance",attendanceRouter);
app.use("/viewAttendance",viewAttendanceRouter);
app.use("/results",resultRouter);
app.use("/todo",todoRouter);

app.listen(PORT,()=>{
    console.log("Server started running")
})
