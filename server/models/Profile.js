
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },

    department: {
      type: String,
      required: [true, "Department is required."],
      trim: true,
      minlength: [2, "Department must contain at least 2 characters."],
      maxlength: [100, "Department cannot exceed 100 characters."],
    },

    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (skills) {
          return (
            Array.isArray(skills) &&
            skills.length <= 30 &&
            skills.every(
              (skill) =>
                typeof skill === "string" &&
                skill.trim().length >= 1 &&
                skill.trim().length <= 50
            )
          );
        },
        message:
          "Skills must contain up to 30 valid text values, each no longer than 50 characters.",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);
