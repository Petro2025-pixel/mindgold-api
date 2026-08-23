import mongoose from "mongoose";
import bcrypt from "bcrypt";

/**
 * User schema definition.
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["player", "editor", "admin"],
      default: "player",
    },
  },
  { timestamps: true },
);

/**
 * Index for filtering users by role.
 */
UserSchema.index({ role: 1 });

/**
 * Pre-save hook to hash user password before saving if modified.
 */
UserSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

/**
 * Compares plain text password with stored hash.
 * @param {string} plaintext - Password to verify.
 * @returns {Promise<boolean>} True if password matches.
 */
UserSchema.methods.comparePassword = async function (plaintext) {
    return bcrypt.compare(plaintext, this.passwordHash);
};

/**
 * Removes sensitive fields before converting to JSON.
 * @returns {Object} User object without passwordHash.
 */
UserSchema.methods.toSafeObject = function () {
    const { passwordHash, __v, ...safe } = this.toObject();
    return safe;
};

/**
 * User Mongoose Model.
 */
export const User = mongoose.model('User', UserSchema);