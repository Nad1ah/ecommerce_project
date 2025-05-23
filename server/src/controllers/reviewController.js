const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Obter todas as avaliações
exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  
  // Se houver um ID de produto na rota, filtrar por esse produto
  if (req.params.productId) {
    filter = { product: req.params.productId };
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

// Obter uma avaliação específica
exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Nenhuma avaliação encontrada com esse ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// Criar nova avaliação
exports.createReview = catchAsync(async (req, res, next) => {
  // Permitir aninhamento de rotas
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  // Verificar se o produto existe
  const product = await Product.findById(req.body.product);
  
  if (!product) {
    return next(new AppError('Nenhum produto encontrado com esse ID', 404));
  }

  // Verificar se o utilizador já avaliou este produto
  const existingReview = await Review.findOne({
    user: req.user.id,
    product: req.body.product,
  });

  if (existingReview) {
    return next(
      new AppError('Você já avaliou este produto. Por favor, edite sua avaliação existente.', 400)
    );
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

// Atualizar avaliação
exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Nenhuma avaliação encontrada com esse ID', 404));
  }

  // Verificar se o utilizador é o autor da avaliação ou um administrador
  if (review.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para editar esta avaliação', 403)
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
});

// Excluir avaliação
exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Nenhuma avaliação encontrada com esse ID', 404));
  }

  // Verificar se o utilizador é o autor da avaliação ou um administrador
  if (review.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para excluir esta avaliação', 403)
    );
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Marcar avaliação como verificada (apenas admin)
exports.verifyReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Nenhuma avaliação encontrada com esse ID', 404));
  }

  review.verified = true;
  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// Curtir uma avaliação
exports.likeReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Nenhuma avaliação encontrada com esse ID', 404));
  }

  review.likes += 1;
  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// Descurtir uma avaliação
exports.dislikeReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Nenhuma avaliação encontrada com esse ID', 404));
  }

  review.dislikes += 1;
  await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});
