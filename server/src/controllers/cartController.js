const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Obter o carrinho do utilizador atual
exports.getMyCart = catchAsync(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id, active: true });

  // Se não existir um carrinho ativo, criar um novo
  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// Adicionar item ao carrinho
exports.addItemToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1, color, size } = req.body;

  // Verificar se o produto existe e está em estoque
  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError('Produto não encontrado', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError('Produto sem estoque suficiente', 400));
  }

  // Encontrar ou criar carrinho
  let cart = await Cart.findOne({ user: req.user.id, active: true });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  // Verificar se o produto já está no carrinho
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Produto já existe no carrinho, atualizar quantidade
    cart.items[itemIndex].quantity += quantity;
    
    // Verificar se a nova quantidade excede o estoque
    if (cart.items[itemIndex].quantity > product.stock) {
      return next(new AppError('Quantidade excede o estoque disponível', 400));
    }
    
    // Atualizar cor e tamanho se fornecidos
    if (color) cart.items[itemIndex].color = color;
    if (size) cart.items[itemIndex].size = size;
  } else {
    // Produto não existe no carrinho, adicionar novo item
    cart.items.push({
      product: productId,
      quantity,
      color,
      size,
    });
  }

  // Atualizar data de modificação
  cart.modifiedAt = Date.now();

  // Salvar carrinho
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// Atualizar quantidade de item no carrinho
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  // Validar quantidade
  if (!quantity || quantity < 1) {
    return next(new AppError('Quantidade deve ser pelo menos 1', 400));
  }

  // Encontrar carrinho
  const cart = await Cart.findOne({ user: req.user.id, active: true });

  if (!cart) {
    return next(new AppError('Carrinho não encontrado', 404));
  }

  // Encontrar item no carrinho
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new AppError('Item não encontrado no carrinho', 404));
  }

  // Verificar estoque
  const product = await Product.findById(cart.items[itemIndex].product);
  
  if (!product) {
    return next(new AppError('Produto não encontrado', 404));
  }

  if (product.stock < quantity) {
    return next(new AppError('Quantidade excede o estoque disponível', 400));
  }

  // Atualizar quantidade
  cart.items[itemIndex].quantity = quantity;
  
  // Atualizar data de modificação
  cart.modifiedAt = Date.now();

  // Salvar carrinho
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// Remover item do carrinho
exports.removeCartItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  // Encontrar carrinho
  const cart = await Cart.findOne({ user: req.user.id, active: true });

  if (!cart) {
    return next(new AppError('Carrinho não encontrado', 404));
  }

  // Encontrar item no carrinho
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === itemId
  );

  if (itemIndex === -1) {
    return next(new AppError('Item não encontrado no carrinho', 404));
  }

  // Remover item
  cart.items.splice(itemIndex, 1);
  
  // Atualizar data de modificação
  cart.modifiedAt = Date.now();

  // Salvar carrinho
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// Limpar carrinho
exports.clearCart = catchAsync(async (req, res, next) => {
  // Encontrar carrinho
  const cart = await Cart.findOne({ user: req.user.id, active: true });

  if (!cart) {
    return next(new AppError('Carrinho não encontrado', 404));
  }

  // Limpar itens
  cart.items = [];
  
  // Atualizar data de modificação
  cart.modifiedAt = Date.now();

  // Salvar carrinho
  await cart.save();

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});
