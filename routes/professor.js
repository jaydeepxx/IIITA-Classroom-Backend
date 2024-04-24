const express = require('express');
const router = express.Router();
const {Student} = require("../models/index");
const { Course, Assignment } = require('../models/index'); // Adjust path as needed

// POST route to mark attendance for a specific course






// Route to post an assignment to a course
router.post('/courses/:courseId/assignments', async (req, res) => {
    try {
        const { title, description, dueDate, files } = req.body;
        const { courseId } = req.params;

        // Create a new assignment
        const assignment = new Assignment({
            title,
            description,
            dueDate,
            course: courseId,
            files,
            postedBy: req.body.id  // Assuming req.user is populated from a middleware
        });

        // Save the assignment
        await assignment.save();

        // Add the assignment to the course's assignment list
        await Course.findByIdAndUpdate(courseId, {
            $push: { assignments: assignment }
        });

        res.status(201).json({ message: 'Assignment posted successfully', assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to post assignment", error: err.message });
    }
});


module.exports = router;
