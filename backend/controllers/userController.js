const User = require("../models/userModel");;
const UserDetails = require("../models/userModelDetails");
const mongoose = require("mongoose")


exports.getAllUsers = async (req, res) => {
  try {
    const { search, gender, country, sortField, sortOrder } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const order = sortOrder === "desc" ? -1 : 1;

    // Pipeline Steps
    const pipeline = [

      { $match: { role: 'user' } },


      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "userId",
          as: "details"
        }
      },


      {
        $unwind: {
          path: "$details",
          preserveNullAndEmptyArrays: true
        }
      },


      {
        $match: {
          $and: [
            search ? {
              $or: [
                { "details.firstName": { $regex: search, $options: "i" } },
                { "details.lastName": { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
              ]
            } : {},
            gender ? { "details.gender": gender } : {},
            country ? { "details.country": country } : {}
          ]
        }
      },


      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          isVerified: 1,
          firstName: "$details.firstName",
          lastName: "$details.lastName",
          bio: "$details.bio",
          gender: "$details.gender",
          country: "$details.country",
          dob: "$details.dob",
          profilePic: "$details.profilePic"
        }
      },


      {
        $sort: { [sortField || "firstName"]: order }
      }
    ];

    // Execute Data Query with Pagination
    const users = await User.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]);

    // Execute Count Query
    const totalResult = await User.aggregate([...pipeline, { $count: "total" }]);
    const total = totalResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: users,

      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });

  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};



//   get user profile ===>>>
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // .lean() use karne se hume direct JS object milta hai, '._doc' ki zarurat nahi padti
    const user = await User.findById(userId).select("-password").lean();
    const details = await UserDetails.findOne({ userId }).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Dono data ko MERGE karein
    // Agar details nahi hain, toh empty object {} merge hoga
    const mergedData = {
      ...user,
      ...(details || {})
    };

    return res.status(200).json({
      success: true,
      data: mergedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//  update user ===>>

exports.updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = req.user._id ? req.user._id.toString() : req.user.id.toString();
    const targetId = id.toString().trim();
    
    // Security Check
    const isSelfUpdate = req.user._id.toString() === id;
    const isAdmin = req.user.role === 'admin';
    
    // console.log("Match Check:", { loggedInUserId, targetId, isSelfUpdate });
    
    if (!isSelfUpdate && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile."
      });
    }
    
    // 1. Destructuring mein variable ka naam change kar diya (oldPic)
    // userController.js line 230 ke aas paas
    const {
      firstName,
      lastName,
      username,
      gender,
      country,
      bio,
      dob,
      profilePic: oldPic
    } = req.body || {}; // <--- Ye '|| {}' lagane se crash nahi hoga
    
    console.log(req.body)
    // 2. Naya variable banayein jo final image path store karega
    let finalProfilePic = oldPic;

    // Agar Multer ne file receive ki hai, toh naya path set karein
    if (req.file) {
      finalProfilePic = `http://localhost:3000/uploads/profiles/${req.file.filename}`;
    }

    // 3. Update Username in Main User Model
    let updatedUser = null;
    if (username) {
      updatedUser = await User.findByIdAndUpdate(id, { username }, { new: true });
    }

    // 4. Update Profile Details in UserDetails Model
    const updatedDetails = await UserDetails.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(id) },
      {
        firstName,
        lastName,
        gender,
        country,
        bio,
        dob,
        profilePic: finalProfilePic // <--- Yahan final path use ho raha hai
      },
      { new: true, runValidators: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: isSelfUpdate ? "Your profile updated!" : "User profile updated by Admin",
      data: {
        ...updatedDetails._doc,
        username: updatedUser ? updatedUser.username : username,
        profilePic: finalProfilePic // Response mein updated pic bhejein
      }
    });

  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};




//  delete user ====>>>

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;


    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access Denied. Only Admins can delete users."
      });
    }

    //  Check  user exists or not
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    //  Security: Admin khud ko delete na kar le
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admins cannot delete their own account from here."
      });
    }

    // Dono collections se data delete karna
    await User.findByIdAndDelete(id);
    await UserDetails.findOneAndDelete({ userId: id });

    return res.status(200).json({
      success: true,
      message: "User and their profile data deleted successfully."
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message
    });
  }
};