// const AWS = require('aws-sdk');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
const {Router} = require("express") 
const { Admin, Student, Professor,Course } = require("../models/index")
const router = Router();
const bcrypt = require('bcrypt');
const upload = require('../middleware/Upload');


// const s3 = new AWS.S3({
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     region: process.env.AWS_REGION
// });
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: process.env.AWS_BUCKET_NAME,
//         // acl: 'public-read',
//         metadata: function (req, file, cb) {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function (req, file, cb) {
//             const extension = file.originalname.split('.').pop();
//             cb(null, `${req.params.type}-${Date.now().toString()}.${extension}`);
//         }
//     })
// });
// const upload = multer();
// Admin router
router.post("/addStudent", upload.single('image'), async (req, res) => {
    console.log(req.file);
    const { name, email, password, rollno } = req.body;
    const imageUrl = req.file ? req.file.location : null;  // Use the uploaded file URL

    const isExist = await Student.findOne({ email: email });
    if (isExist) {
        return res.status(400).json({ msg: "Student already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const studentDetails = await Student.create({
        name,
        email,
        password: hashedPassword,
        rollno,
        image: imageUrl
    });

    studentDetails.password = undefined;
    res.status(200).json({
        msg: "Student added successfully",
        studentDetails
    });
});
// router.post("/addStudentSubject",async (req,res) =>{
//     const courseName = req.body.courseName;
//     const courseId = req.body.courseId;
//     const email = req.headers.email;

//     const courseDetails = await Course.findOne({coursename: courseName, courseid : courseId});
//     const id = courseDetails._id;
//     console.log(id);
//     await Student.updateOne({
//         email: email
//     },{
//         "$push":{
//             courses: id
//         }
//     })
//     res.status(200).json({
//         msg: "Course added to user successfully"
//     })

// })

router.post("/addStudentSubject", async (req, res) => {
    const { courseName, courseId } = req.body;
    const email = req.headers.email;

    try {
        // Find the course details by name and ID
        const courseDetails = await Course.findOne({ coursename: courseName, courseid: courseId });
        if (!courseDetails) {
            return res.status(404).json({ msg: "Course not found" });
        }

        // Find the student and add the course to their record
        const updatedStudent = await Student.findOneAndUpdate(
            { email: email },
            {
                $push: {
                    courses: {
                        course: courseDetails._id, // References the course's ObjectId
                        attendance: [], // Initializes the attendance array
                        midSem: [], 
                        endSem: []
                    }
                }
            },
            { new: true } // Option to return the updated document
        );

        if (!updatedStudent) {
            return res.status(404).json({ msg: "Student not found" });
        }

        // Add the student's ID to the course's students array
        await Course.updateOne(
            { _id: courseDetails._id },
            { $addToSet: { students: updatedStudent._id } } // Use $addToSet to avoid duplicates
        );
        updatedStudent.password = undefined;
        res.status(200).json({
            msg: "Course added to student successfully",
            updatedStudent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Failed to add course to student",
            error: error.message
        });
    }
});




router.post("/addProfessor", upload.single('image'), async (req, res) => {
    const { name, email, password, id } = req.body;
    const imageUrl = req.file ? req.file.location : null;

    const isExist = await Professor.findOne({ email: email, id: id });
    if (isExist) {
        return res.status(400).json({ msg: "Professor already exists" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const professorDetails = await Professor.create({
        id,
        name,
        email,
        password: hashedPassword,
        image: imageUrl
    });

    professorDetails.password = undefined;
    res.status(200).json({
        msg: "Professor added successfully",
        professorDetails
    });
});

router.post("/addProfessorSubject", async (req, res) => {
    const { courseName, courseId } = req.body;
    const email = req.headers.email;

    try {
        // Find the course details by name and ID
        const courseDetails = await Course.findOne({ coursename: courseName, courseid: courseId });
        const professorDetails = await Professor.findOne({ email: email });
        if (!courseDetails) {
            return res.status(404).json({ msg: "Course not found" });
        }

        // Push a new course record into the student's courses array
        const updatedProfessor = await Professor.findOneAndUpdate(
            { email: email },
            {
                $push: {
                    courses: {
                        course: courseDetails._id, // References the course's ObjectId
                    }
                }
            },
            { new: true } // Option to return the updated document
        );

        if (!updatedProfessor) {
            return res.status(404).json({ msg: "Professor not found" });
        }
        const updatedCourse = await Course.findOneAndUpdate(
            { coursename: courseName, courseid: courseId },
            {
                $push: {
                    professor: professorDetails._id
                }
            },
            { new: true } // Option to return the updated document
        );
        res.status(200).json({
            msg: "Course added to professor successfully",
            updatedProfessor,
            updatedCourse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Failed to add course to professor",
            error: error.message
        });
    }
});


router.post("/addAdmin",async (req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    let password = req.body.password;
    // const id = req.body.id;
    
    const isExist = await Admin.findOne({email:email});
    if(isExist){
        return res.status(400).json({
            msg: "Admin Already Exists"
        })
    } 
    const saltRounds = 10;
    const hasedPassword = await bcrypt.hash(password,saltRounds);
    password = hasedPassword;
    const adminDetails = Admin.create({
        name:name,
        email:email,
        password:password,
    }) 
    res.status(200).json({
        msg: "Admin added successfully"
    })
})



module.exports = router