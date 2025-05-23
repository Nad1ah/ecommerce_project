const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Um produto deve ter um nome'],
      trim: true,
      maxlength: [100, 'O nome do produto não pode ter mais de 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'Um produto deve ter uma descrição'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Um produto deve ter um preço'],
      min: [0, 'O preço deve ser maior ou igual a 0'],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function(val) {
          // O preço com desconto deve ser menor que o preço normal
          return val < this.price;
        },
        message: 'O preço com desconto ({VALUE}) deve ser menor que o preço normal',
      },
    },
    category: {
      type: String,
      required: [true, 'Um produto deve pertencer a uma categoria'],
      enum: {
        values: ['roupas', 'calçados', 'acessórios', 'eletrônicos', 'casa', 'livros', 'outros'],
        message: 'Categoria não suportada',
      },
    },
    subcategory: String,
    brand: String,
    images: [String],
    mainImage: String,
    colors: [String],
    sizes: [String],
    stock: {
      type: Number,
      required: [true, 'Um produto deve ter um estoque'],
      min: [0, 'O estoque não pode ser negativo'],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'A avaliação deve ser pelo menos 0'],
      max: [5, 'A avaliação não pode ser maior que 5'],
      set: val => Math.round(val * 10) / 10, // Arredonda para 1 casa decimal
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Um produto deve pertencer a um vendedor'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices para melhorar a performance das consultas
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual para calcular a porcentagem de desconto
productSchema.virtual('discountPercentage').get(function() {
  if (!this.discountPrice) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Middleware para verificar se o produto está em estoque
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
