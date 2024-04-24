const express = require('express');
const router = express.Router();
const { Course, Student } = require('../models/index'); // Ensure path to models is correct
const professorauthenticate = require('../middleware/professorAuth');
const userAuthenticate = require('../middleware/userAuth');

// Middleware to check if the professor is authenticated might be needed here

router.post('/:courseId/:examType', professorauthenticate ,async (req, res) => {
    const { courseId, examType } = req.params;
    const { maxMarks, students } = req.body.data;
    // console.log(req.body);
    // console.log(maxMarks);
    // console.log(students[0].rollno);
    // Validate examType
    if (!['midSem', 'endSem'].includes(examType)) {
        return res.status(400).json({ message: "Invalid exam type specified." });
    }

    try {
        const courseDetails = await Course.findOne({ courseid: courseId });
        // Update the course with maxMarks
        const updateCourse = await Course.findByIdAndUpdate(courseDetails._id, {
            [`${examType}Weightage`]: {
                quiz: maxMarks.quiz,
                review: maxMarks.reviewTest,
                assignment: maxMarks.assignments
            }
        }, { new: true });

        if (!updateCourse) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        // Update each student's marks
        const bulkOps = students.map(student => {
            return {
                updateOne: {
                    filter: { "rollno": student.rollno, "courses.course": courseDetails._id },
                    update: {
                        $set: {
                            [`courses.$.${examType}`]: {
                                quiz: student.quiz,
                                review: student.reviewTest,
                                assignment: student.assignments
                            }
                        }
                    },
                    // arrayFilters: [{ "elem.course": courseId }]
                }
            };
        });

        const result = await Student.bulkWrite(bulkOps, { ordered: false });

        res.status(200).json({
            message: 'Results updated successfully',
            courseDetails: updateCourse,
            updateResults: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error updating results',
            error: error.message
        });
    }
});

router.get('/:courseId/:examType', userAuthenticate ,async (req, res) => {
    const { courseId, examType } = req.params;
    const studentEmail = req.user.email;

    if (!['midSem', 'endSem'].includes(examType)) {
        return res.status(400).json({ message: "Invalid exam type specified." });
    }

    try {
        const courseDetails = await Course.findOne({ courseid: courseId });
        // Update the course with maxMarks
        

        if (!courseDetails) {
            return res.status(404).json({ message: "Course not found" });
        }
        // console.log(studentEmail);
        const results = await Student.findOne({ email: studentEmail},{courses: { $elemMatch: { course: courseDetails._id } }})
        .populate({
            path: 'courses.course',
            match: { _id: courseDetails._id }
        });
        const result = results.courses[0];
        const resultData = result[examType];
        res.status(200).json({
            message: 'Results retrieved successfully',
            courseMarks: courseDetails,
            studentMarks: resultData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error updating results',
            error: error.message
        });
    }
});



module.exports = router;
