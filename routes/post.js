const {Router} = require("express");
const {Course, Student,Professor} = require("../models/index"); 
const Userauthenticate = require("../middleware/user");
const upload = require('../middleware/upload');
const router = Router();

router.post("/:courseid", Userauthenticate, upload.single('file'), async (req, res) => {
    const courseid = req.params.courseid;
    const author = req.name; // Assuming name is stored in user after authentication
    const content = req.body.content; 
    const fileUrl = req.file ? req.file.location : null; // URL returned from S3
    const authorEmail = req.email;

    const courseDetails = await Course.findOne({courseid: courseid});
    if (!courseDetails) {
        return res.status(404).json({msg: "Course not found"});
    }
    const authorDetails = await Professor.findOne({email: authorEmail});
    const authorImage = authorDetails.image;
    await Course.updateOne(
        { courseid: courseid },
        {
            "$push": {
                "posts": {
                    author: author,
                    authorImage: authorImage,
                    content: content,
                    date: new Date().toISOString(),
                    fileUrl: fileUrl // Include the file URL in the posts array
                }
            }
        }
    );
    
    res.status(200).json({
        msg: "Post added successfully",
        post: {
            author,
            content,
            fileUrl,
            authorImage
        }
    });
});

module.exports = router;