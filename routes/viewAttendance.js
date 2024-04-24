const express = require('express');
const router = express.Router();
const {Student} = require("../models/index");
const { Course, Assignment } = require('../models/index'); // Adjust path as needed
const Userauthenticate = require('../middleware/user');
const professorauthenticate = require('../middleware/professorAuth');
const userAuthenticate = require('../middleware/userAuth');


router.get('/:courseId', userAuthenticate, async (req, res) => {
    const { courseId } = req.params;
    const studentEmail = req.user.email;  // Email is extracted from JWT by middleware

    try {
        // Find the student by email and filter to include only the specified course's ID
        const courseDetails = await Course.findOne({ courseid: courseId }); 
        const student = await Student.findOne({ email: studentEmail })
            .populate({
                path: 'courses.course',
                match: { _id: courseDetails._id }
            });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Extract the specific course data from the populated student document
        const courseRecord = student.courses.find(c => c.course && c.course._id.toString() === courseDetails._id.toString());

        if (!courseRecord) {
            return res.status(404).json({ message: 'Course not found within student records' });
        }

        res.status(200).json({
            message: 'Attendance data retrieved successfully',
            attendance: courseRecord.attendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error retrieving attendance data',
            error: error.message
        });
    }
});

module.exports = router;
