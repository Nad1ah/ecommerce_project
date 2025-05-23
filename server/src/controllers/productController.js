const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

// Obter todos os produtos
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Executar consulta com recursos de API (filtro, ordenação, paginação)
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  const products = await features.query;

  // Enviar resposta
  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Obter um produto específico
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews');

  if (!product) {
    return next(new AppError('Nenhum produto encontrado com esse ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Criar novo produto
exports.createProduct = catchAsync(async (req, res, next) => {
  // Adicionar o ID do vendedor (utilizador atual)
  req.body.seller = req.user.id;
  
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

// Atualizar produto
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Nenhum produto encontrado com esse ID', 404));
  }

  // Verificar se o utilizador é o vendedor ou um administrador
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para atualizar este produto', 403)
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(
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
      product: updatedProduct,
    },
  });
});

// Excluir produto
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Nenhum produto encontrado com esse ID', 404));
  }

  // Verificar se o utilizador é o vendedor ou um administrador
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para excluir este produto', 403)
    );
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Obter produtos em destaque
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const limit = req.query.limit * 1 || 5;
  
  const products = await Product.find({ featured: true })
    .limit(limit)
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Obter produtos por categoria
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  const products = await Product.find({ category });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Pesquisar produtos
exports.searchProducts = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query) {
    return next(new AppError('Por favor, forneça um termo de pesquisa', 400));
  }

  const products = await Product.find({
    $text: { $search: query },
  }).sort({ score: { $meta: 'textScore' } });

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Upload de imagens de produto
exports.uploadProductImages = catchAsync(async (req, res, next) => {
  if (!req.files) {
    return next(new AppError('Por favor, faça upload de pelo menos uma imagem', 400));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('Nenhum produto encontrado com esse ID', 404));
  }

  // Verificar se o utilizador é o vendedor ou um administrador
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para atualizar este produto', 403)
    );
  }

  // Processar imagens
  const images = req.files.map(file => file.filename);
  
  // Definir imagem principal se não existir
  if (!product.mainImage && images.length > 0) {
    product.mainImage = images[0];
  }

  // Adicionar novas imagens ao array existente
  product.images = [...product.images, ...images];
  
  await product.save();

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});
