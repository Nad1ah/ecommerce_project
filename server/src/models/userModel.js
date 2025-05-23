const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor, forneça um nome'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Por favor, forneça um email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Por favor, forneça um email válido'],
    },
    password: {
      type: String,
      required: [true, 'Por favor, forneça uma senha'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    phone: String,
    avatar: String,
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para criptografar senha antes de salvar
userSchema.pre('save', async function (next) {
  // Só executa se a senha foi modificada
  if (!this.isModified('password')) return next();

  // Hash a senha com custo de 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para verificar se a senha está correta
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
