const {Router} = require("express");
const router = Router();
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const {Student} = require("../models/index");
const { Course,Submission } = require('../models/index'); // Adjust path as needed

// Student routes
router.post("/login",async (req,res) =>{
try{
    const email = req.body.email;
    const password = req.body.password;

    //check student exists or not
    const student = await Student.findOne({email: email});
    // const student = await Student.findOne({ email: email }).populate({
    //     path: 'courses.course',
    //     model: 'Course', // Assuming you have a Course model set up correctly
    //     // populate: {
    //     //     path: 'professor',
    //     //     model: 'Professor' // Further populating the professor data if needed
    //     // }
    // });
    if(await !student){
        return res.status(400).json({
            msg: "User not exists"
        })
    }
    const checkPassword = await bcrypt.compare(password,student.password);
    if(await !checkPassword){
        return res.status(400).json({
            message:"Incorrect email or password"
        })
        
    }
    // const courses = await Student.courses
    const token = jwt.sign({ email: email }, 'sadadsa', { expiresIn: '1h' });
    // const { password: _, ...studentData } = student.toObject();
    
    student.password = undefined;
    student.courses = undefined;
    res.json({
        message: 'Login successful',
        student: student.toObject({ virtuals: true }),
        token
    })
} catch(err){
    res.status(500).json({message: "Server error"});
}


});



// Route for a student to submit an assignment
router.post('/assignments/:assignmentId/submissions', async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { submissionFile } = req.body; // URL to the submitted file, assumed to be pre-uploaded
        // const id=req.body.id;
        // Create a new submission
        const submission = new Submission({
            assignment: assignmentId,
            student: req.body.id, // Assuming req.user is populated from a middleware
            submissionFile
        });

        // Save the submission
        await submission.save();

        // Optionally update student's document with the submission record
        await Student.findByIdAndUpdate(req.body.id, {
            $push: { submissions: submission }
        });

        res.status(201).json({ message: 'Submission successful', submission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to submit assignment", error: err.message });
    }
});


// Route to get all assignments for a course
router.get('/courses/:courseId/assignments', async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Find the course with its assignments
        const course = await Course.findById(courseId).populate({
            path: 'assignments',
            populate: { path: 'postedBy', select: 'name email' }  // Populate details of the person who posted the assignments
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json({ message: 'Assignments retrieved successfully', assignments: course.assignments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve assignments", error: err.message });
    }
});


module.exports = router