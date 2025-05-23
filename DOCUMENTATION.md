# Plataforma de E-commerce para Produtos Artesanais

## Visão Geral

Esta plataforma de e-commerce foi desenvolvida para permitir a venda online de produtos artesanais, oferecendo uma experiência completa tanto para clientes quanto para administradores. O sistema foi construído utilizando tecnologias modernas como React, TypeScript, Node.js, Express e MongoDB.

## Estrutura do Projeto

O projeto está organizado em duas partes principais:

### Backend (server)

- **Tecnologias**: Node.js, Express, MongoDB
- **Estrutura**:
  - `config/`: Configurações do servidor e banco de dados
  - `controllers/`: Lógica de negócios para cada entidade
  - `middleware/`: Funções intermediárias para autenticação e validação
  - `models/`: Esquemas de dados para MongoDB
  - `routes/`: Definição de endpoints da API
  - `utils/`: Funções utilitárias

### Frontend (client)

- **Tecnologias**: React, TypeScript, Tailwind CSS
- **Estrutura**:
  - `src/assets/`: Recursos estáticos como imagens
  - `src/components/`: Componentes reutilizáveis da UI
  - `src/context/`: Contextos React para gerenciamento de estado
  - `src/hooks/`: Hooks personalizados
  - `src/lib/`: Bibliotecas e utilitários
  - `src/pages/`: Componentes de página
  - `src/services/`: Serviços para comunicação com a API
  - `src/tests/`: Testes unitários e de integração

## Funcionalidades Principais

### Autenticação e Gestão de Utilizadores
- Registo e login de utilizadores
- Perfil de utilizador com histórico de compras
- Níveis de acesso (cliente, administrador)
- Gestão de endereços de entrega

### Catálogo de Produtos
- Listagem de produtos com paginação
- Detalhes do produto com imagens, descrição e preço
- Categorização de produtos
- Sistema de pesquisa e filtros avançados
- Avaliações e comentários de produtos

### Carrinho de Compras
- Adicionar/remover produtos
- Atualizar quantidades
- Cálculo automático de totais
- Persistência do carrinho (mesmo após logout)
- Aplicação de códigos promocionais

### Processo de Checkout
- Seleção de endereço de entrega
- Escolha de método de envio
- Seleção de método de pagamento
- Resumo do pedido antes da finalização
- Confirmação de pedido com email

### Gestão de Pedidos
- Histórico de pedidos para utilizadores
- Detalhes do pedido com status de entrega
- Cancelamento de pedidos (quando aplicável)
- Notificações de atualização de status

### Painel de Administração
- Gestão de produtos (adicionar, editar, remover)
- Gestão de categorias
- Processamento de pedidos
- Gestão de stock
- Relatórios de vendas e análises

## Modelos de Dados

### User
- Informações pessoais (nome, email, senha)
- Endereço
- Função (utilizador ou administrador)
- Lista de desejos

### Product
- Informações do produto (nome, descrição, preço)
- Categoria e subcategoria
- Imagens
- Stock
- Avaliações
- Variantes (cores, tamanhos)

### Order
- Utilizador
- Itens do pedido
- Endereço de entrega
- Método de pagamento
- Status do pedido
- Informações de pagamento e entrega

### Cart
- Utilizador
- Itens do carrinho
- Quantidades
- Variantes selecionadas

### Review
- Utilizador
- Produto
- Classificação
- Título e comentário
- Imagens
- Likes/dislikes

## Fluxos Principais

### Fluxo de Compra
1. Navegação pelo catálogo de produtos
2. Visualização de detalhes do produto
3. Adição de produtos ao carrinho
4. Revisão do carrinho
5. Processo de checkout
6. Confirmação do pedido

### Fluxo de Gestão de Conta
1. Registo ou login
2. Atualização de informações pessoais
3. Gestão de endereços
4. Visualização do histórico de pedidos
5. Acompanhamento de pedidos em andamento

## API Endpoints

### Autenticação
- `POST /api/auth/signup`: Registo de novo utilizador
- `POST /api/auth/login`: Login de utilizador
- `GET /api/auth/me`: Obter perfil do utilizador atual
- `PATCH /api/auth/updateMe`: Atualizar perfil do utilizador
- `PATCH /api/auth/updateMyPassword`: Atualizar senha do utilizador

### Produtos
- `GET /api/products`: Listar produtos
- `GET /api/products/:id`: Obter detalhes de um produto
- `GET /api/products/featured`: Obter produtos em destaque
- `GET /api/products/category/:category`: Obter produtos por categoria
- `GET /api/products/search`: Pesquisar produtos
- `POST /api/products`: Criar novo produto (admin)
- `PATCH /api/products/:id`: Atualizar produto (admin)
- `DELETE /api/products/:id`: Remover produto (admin)

### Carrinho
- `GET /api/cart`: Obter carrinho do utilizador
- `POST /api/cart/items`: Adicionar item ao carrinho
- `PATCH /api/cart/items/:itemId`: Atualizar item do carrinho
- `DELETE /api/cart/items/:itemId`: Remover item do carrinho
- `DELETE /api/cart`: Limpar carrinho

### Pedidos
- `POST /api/orders`: Criar novo pedido
- `GET /api/orders/myorders`: Obter pedidos do utilizador
- `GET /api/orders/:id`: Obter detalhes de um pedido
- `PATCH /api/orders/:id/pay`: Atualizar pedido para pago
- `PATCH /api/orders/:id/cancel`: Cancelar pedido
- `GET /api/orders`: Listar todos os pedidos (admin)
- `PATCH /api/orders/:id/deliver`: Atualizar pedido para entregue (admin)

### Avaliações
- `GET /api/products/:productId/reviews`: Obter avaliações de um produto
- `POST /api/products/:productId/reviews`: Adicionar avaliação a um produto
- `PATCH /api/reviews/:id`: Atualizar avaliação
- `DELETE /api/reviews/:id`: Remover avaliação

## Segurança

- Autenticação baseada em JWT (JSON Web Tokens)
- Senhas criptografadas com bcrypt
- Proteção contra CSRF e XSS
- Validação de dados em todas as entradas
- Controle de acesso baseado em funções

## Testes

O projeto inclui testes unitários e de integração para garantir o funcionamento correto de todos os componentes:

- Testes unitários para componentes React
- Testes de integração para fluxos principais
- Testes de API para endpoints do backend

## Requisitos de Sistema

### Desenvolvimento
- Node.js (v14 ou superior)
- npm ou yarn
- MongoDB (local ou Atlas)

### Produção
- Servidor Node.js
- Banco de dados MongoDB
- Servidor web (opcional, para servir arquivos estáticos)

## Próximos Passos e Melhorias Futuras

- Implementação de sistema de pagamento real (Stripe, PayPal)
- Integração com serviços de email para notificações
- Dashboard analítico avançado para administradores
- Sistema de recomendação de produtos
- Aplicativo móvel complementar
- Otimização de SEO para melhor visibilidade
