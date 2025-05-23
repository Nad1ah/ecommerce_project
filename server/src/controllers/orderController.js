const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Obter todos os pedidos do utilizador atual
exports.getMyOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});

// Obter um pedido específico
exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Nenhum pedido encontrado com esse ID', 404));
  }

  // Verificar se o pedido pertence ao utilizador atual ou se é um administrador
  if (order.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para ver este pedido', 403)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Criar novo pedido
exports.createOrder = catchAsync(async (req, res, next) => {
  // Verificar se o utilizador tem um carrinho
  const cart = await Cart.findOne({ user: req.user.id, active: true });
  
  if (!cart || cart.items.length === 0) {
    return next(new AppError('Seu carrinho está vazio', 400));
  }

  // Verificar estoque
  if (!cart.checkStock()) {
    return next(new AppError('Um ou mais produtos não estão disponíveis em estoque', 400));
  }

  // Preparar itens do pedido
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    image: item.product.mainImage || (item.product.images.length > 0 ? item.product.images[0] : ''),
    price: item.product.discountPrice || item.product.price,
    color: item.color,
    size: item.size,
  }));

  // Calcular preços
  const itemsPrice = cart.totalPrice;
  const taxPrice = itemsPrice * 0.23; // IVA de 23%
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Frete grátis acima de 100€
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Criar pedido
  const order = await Order.create({
    user: req.user.id,
    orderItems,
    shippingAddress: req.body.shippingAddress,
    paymentMethod: req.body.paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Atualizar estoque dos produtos
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Limpar carrinho
  await cart.clearCart();

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
});

// Atualizar status do pedido para pago
exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Nenhum pedido encontrado com esse ID', 404));
  }

  // Verificar se o pedido pertence ao utilizador atual ou se é um administrador
  if (order.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para atualizar este pedido', 403)
    );
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    update_time: req.body.update_time,
    email_address: req.body.email_address,
  };
  order.status = 'processando';

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder,
    },
  });
});

// Atualizar status do pedido para entregue (apenas admin)
exports.updateOrderToDelivered = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Nenhum pedido encontrado com esse ID', 404));
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  order.status = 'entregue';
  order.trackingNumber = req.body.trackingNumber;

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder,
    },
  });
});

// Cancelar pedido
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Nenhum pedido encontrado com esse ID', 404));
  }

  // Verificar se o pedido pertence ao utilizador atual ou se é um administrador
  if (order.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError('Você não tem permissão para cancelar este pedido', 403)
    );
  }

  // Verificar se o pedido pode ser cancelado
  if (!order.canBeCancelled()) {
    return next(
      new AppError('Este pedido não pode ser cancelado', 400)
    );
  }

  // Atualizar status
  order.status = 'cancelado';
  
  // Restaurar estoque
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  const updatedOrder = await order.save();

  res.status(200).json({
    status: 'success',
    data: {
      order: updatedOrder,
    },
  });
});

// Obter todos os pedidos (apenas admin)
exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: {
      orders,
    },
  });
});
