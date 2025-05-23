const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Um carrinho deve pertencer a um utilizador'],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'A quantidade deve ser pelo menos 1'],
          default: 1,
        },
        color: String,
        size: String,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    modifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índice para melhorar a performance das consultas
cartSchema.index({ user: 1 });

// Middleware para popular informações do produto
cartSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'items.product',
    select: 'name price images stock discountPrice',
  });
  
  next();
});

// Virtual para calcular o total do carrinho
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => {
    const price = item.product.discountPrice || item.product.price;
    return total + price * item.quantity;
  }, 0);
});

// Virtual para calcular o número total de itens
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Método para verificar se todos os itens estão em estoque
cartSchema.methods.checkStock = function() {
  return this.items.every(item => item.product.stock >= item.quantity);
};

// Método para limpar o carrinho
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.modifiedAt = Date.now();
  return this.save();
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
