const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uma avaliação deve pertencer a um utilizador'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Uma avaliação deve pertencer a um produto'],
    },
    rating: {
      type: Number,
      required: [true, 'Uma avaliação deve ter uma classificação'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, 'Uma avaliação deve ter um título'],
      trim: true,
      maxlength: [100, 'O título não pode ter mais de 100 caracteres'],
    },
    comment: {
      type: String,
      required: [true, 'Uma avaliação deve ter um comentário'],
      trim: true,
    },
    images: [String],
    verified: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    dislikes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Índices compostos para garantir que um utilizador só pode avaliar um produto uma vez
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Middleware para popular informações do utilizador
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name avatar',
  });
  
  next();
});

// Método estático para calcular a média de avaliações de um produto
reviewSchema.statics.calcAverageRatings = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: stats[0].numReviews,
      rating: stats[0].avgRating,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      numReviews: 0,
      rating: 0,
    });
  }
};

// Middleware para calcular a média de avaliações após salvar
reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.product);
});

// Middleware para calcular a média de avaliações após atualizar ou remover
reviewSchema.post(/^findOneAnd/, async function(doc) {
  if (doc) {
    await doc.constructor.calcAverageRatings(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
