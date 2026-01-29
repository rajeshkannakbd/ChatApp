// middleware/Auth.js
import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: store ONLY userId
    req.user = { _id: decoded.userId };

    next();
  } catch (error) {
    console.log(error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
