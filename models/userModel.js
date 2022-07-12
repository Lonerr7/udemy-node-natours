const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a vaild email!'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on Model.CREATE  Model.SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
});

// Password encryption in pre middleware
userSchema.pre('save', async function (next) {
  // Checking if we changed or created a password to ecnrypt it
  if (!this.isModified('password')) return next();

  // Ecnrypting a password field
  this.password = await bcrypt.hash(this.password, 12);
  // Deleting passwordConfirm after encrypting a password (passwordConfirm is not being encrypted)
  this.passwordConfirm = undefined;

  next();
});

// Function which checks password and confirmPassword fields
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Function which checks if user has changed his password
userSchema.methods.changedPasswordsAfter = function (JWTTimestamp) {
  // in an instance method THIS points to the current document
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
