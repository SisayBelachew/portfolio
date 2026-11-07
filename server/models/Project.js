
const mongoose = require("mongoose");

// Validate optional HTTP/HTTPS URLs
function isValidUrl(value) {
  if (!value) return true;

  try {
    const parsedUrl = new URL(value);

    return (
      ["http:", "https:"].includes(parsedUrl.protocol) &&
      Boolean(parsedUrl.hostname)
    );
  } catch {
    return false;
  }
}

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required."],
      trim: true,
      minlength: [3, "Title must contain at least 3 characters."],
      maxlength: [100, "Title cannot exceed 100 characters."],
    },

    description: {
      type: String,
      required: [true, "Project description is required."],
      trim: true,
      minlength: [10, "Description must contain at least 10 characters."],
      maxlength: [2000, "Description cannot exceed 2000 characters."],
    },

    technologies: {
      type: [String],
      default: [],
      validate: [
        {
          validator: function (technologies) {
            return (
              Array.isArray(technologies) &&
              technologies.length <= 20 &&
              technologies.every(
                (technology) =>
                  typeof technology === "string" &&
                  technology.trim().length >= 1 &&
                  technology.trim().length <= 50
              )
            );
          },
          message:
            "Technologies must contain up to 20 valid text values, each no longer than 50 characters.",
        },
      ],
    },

    liveUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Live URL is too long."],
      validate: {
        validator: isValidUrl,
        message: "Live URL must be a valid HTTP or HTTPS URL.",
      },
    },

    githubUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "GitHub URL is too long."],
      validate: {
        validator: isValidUrl,
        message: "GitHub URL must be a valid HTTP or HTTPS URL.",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
