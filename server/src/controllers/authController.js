const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Função para criar token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Função para enviar token JWT como resposta
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Remover a senha da saída
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Registar novo utilizador
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    address: req.body.address,
    phone: req.body.phone,
  });

  createSendToken(newUser, 201, res);
});

// Login de utilizador
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Verificar se email e password foram fornecidos
  if (!email || !password) {
    return next(new AppError('Por favor, forneça email e senha', 400));
  }

  // 2) Verificar se o utilizador existe e se a senha está correta
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email ou senha incorretos', 401));
  }

  // 3) Se tudo estiver ok, enviar token para o cliente
  createSendToken(user, 200, res);
});

// Middleware para proteger rotas
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Obter token e verificar se existe
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Você não está logado. Por favor, faça login para obter acesso.', 401)
    );
  }

  // 2) Verificar token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Verificar se o utilizador ainda existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('O utilizador pertencente a este token não existe mais.', 401)
    );
  }

  // 4) Conceder acesso à rota protegida
  req.user = currentUser;
  next();
});

// Middleware para restringir acesso a determinados papéis
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Você não tem permissão para realizar esta ação', 403)
      );
    }

    next();
  };
};

// Obter dados do utilizador atual
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Atualizar dados do utilizador atual
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Criar erro se o utilizador tentar atualizar a senha
  if (req.body.password) {
    return next(
      new AppError(
        'Esta rota não é para atualizações de senha. Por favor, use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtrar campos não permitidos
  const filteredBody = filterObj(req.body, 'name', 'email', 'address', 'phone');
  if (req.file) filteredBody.avatar = req.file.filename;

  // 3) Atualizar documento do utilizador
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Função auxiliar para filtrar objetos
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Desativar conta de utilizador
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Atualizar senha do utilizador
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) Obter utilizador da coleção
  const user = await User.findById(req.user.id).select('+password');

  // 2) Verificar se a senha atual está correta
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Sua senha atual está incorreta.', 401));
  }

  // 3) Atualizar senha
  user.password = req.body.password;
  await user.save();

  // 4) Fazer login do utilizador, enviar JWT
  createSendToken(user, 200, res);
});
