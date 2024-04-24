const express = require('express');
const router = express.Router();
const {Student} = require("../models/index");
const { Course, Assignment } = require('../models/index'); // Adjust path as needed
const Userauthenticate = require('../middleware/user');
const professorauthenticate = require('../middleware/professorAuth');

router.get("/:courseId", professorauthenticate ,async (req, res) => {
    const { courseId } = req.params;

    try {
        // Find the course by courseid and populate the students array
        const courseWithStudents = await Course.findOne({ courseid: courseId })
            .populate('students', 'name email rollno image');  // Customize the fields you need from the Student model

        if (!courseWithStudents) {
            return res.status(404).json({ msg: "Course not found" });
        }

        if (courseWithStudents.students.length === 0) {
            return res.status(404).json({ msg: "No students enrolled in this course" });
        }

        res.status(200).json({
            msg: "Students retrieved successfully",
            students: courseWithStudents.students
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: "Failed to retrieve students",
            error: error.message
        });
    }
});

router.post('/:courseId', professorauthenticate,async (req, res) => {
    console.log(req.body);
    const { courseId } = req.params;
    const attendanceData = req.body.attendanceData; // Correctly accessing attendanceData
    console.log(attendanceData)
    if (!Array.isArray(attendanceData)) {
        return res.status(400).json({ message: 'Invalid input format, expected an array of attendance records' });
    }
    const courseDetails = await Course.findOne({ courseid: courseId });
    // Student.findOne({ "rollno": "iib2021023", "courses.course": "BA111" })
    // .then(doc => console.log(doc))
    // .catch(err => console.error(err));

    try {
        const bulkOps = attendanceData.map(attendance => {
            return {
                updateOne: {
                    filter: { "rollno": attendance.rollno, "courses.course": courseDetails._id },
                    update: {
                        $push: {
                            "courses.$.attendance": {
                                date: attendance.date,
                                present: attendance.status // Ensure conversion from string to boolean
                            }
                        }
                    }
                }
            };
        });

        const result = await Student.bulkWrite(bulkOps, { ordered: false });

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No students or courses found with given IDs' });
        }

        res.status(200).json({
            message: 'Attendance marked successfully for all students',
            details: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating attendance', error: error.message });
    }
});


module.exports = router;