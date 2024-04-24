const {Router} = require("express");
const { Course, Professor, Student } = require("../models/index");
const Userauthenticate = require("../middleware/user");
const e = require("express");

const router = Router();



router.post("/addCourse", async (req, res) => {
    const { courseName, courseId, professors,courseImage } = req.body;

    try {
        const isExist = await Course.findOne({ courseid: courseId });
        if (isExist) {
            return res.status(400).json({ msg: "Course already exists" });
        }

        const professorIds = await Promise.all(professors.map(async (professor) => {
            const professorDetails = await Professor.findOne({ id: professor.id });
            if (!professorDetails) {
                throw new Error(`Professor with ID ${professor.id} not found`);
            }
            return professorDetails._id;
        }));

        const courseDetails = await Course.create({
            coursename: courseName,
            courseid: courseId,
            courseImage:courseImage,
            professor: professorIds
        });
        // console.log(courseDetails);
        await Promise.all(professors.map(async (professor) => {
            const professorDetails = await Professor.findOne({ id: professor.id });
            if (!professorDetails) {
                throw new Error(`Professor with ID ${professor.id} not found`);
            }
            await Professor.findByIdAndUpdate(professorDetails._id, { $push: { courses: {
                course: courseDetails._id,
            } } });
            
        }));
        res.status(200).json({ msg: "Course added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Failed to add course", error: error.message });
    }
});

// router.post("/updateCourse/:courseId", async (req, res) => {
//     const { courseId } = req.params;
//     const { courseName,professors,courseImage } = req.body;

//     try {
//         const isExist = await Course.findOne({ courseid: courseId });
//         if (isExist) {
//             const professorIds = await Promise.all(professors.map(async (professor) => {
//                 const professorDetails = await Professor.findOne({ id: professor.id });
//                 if (!professorDetails) {
//                     throw new Error(`Professor with ID ${professor.id} not found`);
//                 }
//                 return professorDetails._id;
//             }));
    
//             const courseDetails = await Course.findByIdAndUpdate({
//                 coursename: courseName,
//                 courseid: courseId,
//                 courseImage:courseImage,
//                 professor: professorIds
//             });
//             // console.log(courseDetails);
//             await Promise.all(professors.map(async (professor) => {
//                 const professorDetails = await Professor.findOne({ id: professor.id });
//                 if (!professorDetails) {
//                     throw new Error(`Professor with ID ${professor.id} not found`);
//                 }
//                 await Professor.findByIdAndUpdate(professorDetails._id, { $push: { courses: {
//                     course: courseDetails._id,
//                 } } });
                
//             }));
//             res.status(200).json({ msg: "Course updated successfully" });
//         }else{
//             return res.status(404).json({ msg: "Course not found" });
//         }

        
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: "Failed to add course", error: error.message });
//     }
// });



router.delete("/deleteCourse/:courseId", async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await Course.findOne({ courseid: courseId });
        if (!course) {
            return res.status(404).json({ msg: "Course not found" });
        }

        await Course.deleteOne({ courseid: courseId });

        await Student.updateMany(
            { 'courses.course': course._id },
            { $pull: { courses: { course: course._id } } }
        );

        await Professor.updateMany(
            { 'courses.course': course._id },
            { $pull: { courses: { course: course._id } } }
        );

        res.status(200).json({ msg: "Course deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Failed to delete course", error: error.message });
    }
});


router.get("/:courseid", Userauthenticate, async (req, res) => {
    const courseid = req.params.courseid;
    try {
        const CourseDetails = await Course.findOne({ courseid: courseid }).populate({
            path: 'professor',
            model: 'Professor'
        });

        if (!CourseDetails) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Set each professor's password to undefined
        for (const prof of CourseDetails.professor) {
            prof.password = undefined;
        }

        console.log(CourseDetails);
        res.status(200).json({
            course: CourseDetails
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


module.exports = router;