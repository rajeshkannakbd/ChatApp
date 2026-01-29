import { generateToken } from "../lib/utils.js";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

// signup new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });
    await newUser.save();
    const token = generateToken(newUser._id);
    return res
      .status(201)
      .json({ message: "User created successfully", token, user: newUser });
  } catch (error) {
    console.log(error.message);
    res.json({ message: "Error creating user", error: error.message });
  }
};

// login route
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);
    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.log(error.message);
    res.json({ message: "Error logging in", error: error.message });
  }
};

// controller to check if user is aythenticated

export const checkAuth = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User authenticated", user });
  } catch (error) {
    console.log(error.message);
    res.json({
      message: "Error checking authentication",
      error: error.message,
    });
  }
};

// controllers to update user profile details

// export const updateProfile = async (req,res)=>{
//   try {
//     const {fullName , profilePic , bio} = req.body
//     const userId = req.user._id;
//     let updatedUser;
//     if (!profilePic) {
//       await User.findByIdAndUpdate(userId, {bio, fullName},{new: true})
//     }else{
//       const upload = await cloudinary.uploader.upload(profilePic);
//       updatedUser = await User.findByIdAndUpdate(userId,{profilePic: upload.secure_url, bio , fullName},{new: true})
//     }
//     res.status(200).json({user: updatedUser})
//   } catch (error) {
//     res.status(400).json({message: error.message})
//   }
// }// update profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, profilePic, bio } = req.body;

    // FIX: req.user IS the userId
    const userId = req.user;

    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { fullName, bio },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);
      updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          profilePic: upload.secure_url,
          fullName,
          bio,
        },
        { new: true }
      );
    }

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};