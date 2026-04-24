const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },

   bio: {
    type: String,
    max: 200
  },

  gender: {
    type: String,
    enum: ["Male", "Female"],
  },

  country: {
    type: String
  },

  dob: {
    type: Date
  },

  profilePic: {
  type: String
},

}, { timestamps: true });


const UserDetails = mongoose.model("UserDetails", userDetailsSchema)

module.exports = UserDetails;
