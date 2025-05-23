const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Um pedido deve pertencer a um utilizador'],
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        color: String,
        size: String,
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cartão de crédito', 'paypal', 'transferência bancária', 'multibanco'],
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['pendente', 'processando', 'enviado', 'entregue', 'cancelado'],
      default: 'pendente',
    },
    trackingNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Middleware para popular informações do produto e do utilizador
orderSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email',
  }).populate({
    path: 'orderItems.product',
    select: 'name price images',
  });
  
  next();
});

// Virtual para calcular o número total de itens
orderSchema.virtual('totalItems').get(function() {
  return this.orderItems.reduce((acc, item) => acc + item.quantity, 0);
});

// Método para verificar se o pedido pode ser cancelado
orderSchema.methods.canBeCancelled = function() {
  return ['pendente', 'processando'].includes(this.status) && !this.isDelivered;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
