
const mongoose = require("mongoose");
require("dotenv").config();
const Project = require("./models/Project");

async function cleanDuplicateProjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const titlesToCheck = [
      "Online Food Ordering System",
      "Database Management System",
    ];

    for (const title of titlesToCheck) {
      const projects = await Project.find({ title }).sort({
        _id: 1,
      });

      if (projects.length > 1) {
        // Keep the first record and remove the extras
        const duplicates = projects.slice(1);

        for (const duplicate of duplicates) {
          await Project.findByIdAndDelete(duplicate._id);
          console.log(
            `Removed duplicate "${title}": ${duplicate._id}`
          );
        }
      } else {
        console.log(`"${title}" has no duplicates.`);
      }
    }

    console.log("Duplicate cleanup completed.");
  } catch (error) {
    console.error("Cleanup error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

cleanDuplicateProjects();
