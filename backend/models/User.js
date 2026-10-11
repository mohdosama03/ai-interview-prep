import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role: { type: String, default: "Frontend Developer" }, // target job role
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Intermediate", "Experienced"],
      default: "Fresher",
    },
    skills: { type: [String], default: [] },
    profileImage: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    streak: { type: Number, default: 0 },
    lastPracticeDate: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
