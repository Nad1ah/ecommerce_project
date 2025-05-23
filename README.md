# Plataforma de E-commerce para Produtos Artesanais

Uma plataforma completa de e-commerce desenvolvida com React, TypeScript, Node.js, Express e MongoDB, focada na venda de produtos artesanais.

## Características Principais

- 🛒 Catálogo de produtos com filtros e pesquisa
- 👤 Sistema de autenticação e gestão de utilizadores
- 🛍️ Carrinho de compras com persistência
- 💳 Processo de checkout completo
- 📦 Gestão de pedidos e histórico
- ⭐ Sistema de avaliações de produtos
- 📱 Design responsivo para dispositivos móveis e desktop

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Backend (server)

Desenvolvido com Node.js, Express e MongoDB, fornecendo uma API RESTful completa.

### Frontend (client)

Desenvolvido com React, TypeScript e Tailwind CSS, oferecendo uma interface moderna e responsiva.

## Instalação e Configuração

### Requisitos

- Node.js (v14 ou superior)
- npm ou yarn
- MongoDB (local ou Atlas)

### Passos para Instalação

1. Clone o repositório:
   ```
   git clone <url-do-repositorio>
   cd ecommerce
   ```

2. Instale as dependências do backend:
   ```
   cd server
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na pasta `server` com as seguintes variáveis:
     ```
     PORT=5000
     MONGO_URI=sua_string_de_conexao_mongodb
     JWT_SECRET=seu_segredo_jwt
     JWT_EXPIRES_IN=90d
     ```

4. Instale as dependências do frontend:
   ```
   cd ../client/ecommerce-app
   npm install
   ```

5. Configure a URL da API:
   - No arquivo `src/services/api.ts`, ajuste a URL base da API se necessário.

## Execução

### Backend

```
cd server
npm run dev
```

O servidor será iniciado na porta 5000 (ou na porta definida no arquivo .env).

### Frontend

```
cd client/ecommerce-app
npm run dev
```

A aplicação frontend será iniciada e estará disponível em `http://localhost:3000`.

## Funcionalidades Detalhadas

Para uma descrição completa de todas as funcionalidades, modelos de dados, endpoints da API e fluxos principais, consulte o arquivo [DOCUMENTATION.md](./DOCUMENTATION.md).

## Testes

O projeto inclui testes unitários e de integração:

```
cd client/ecommerce-app
npm test
```

## Integração ao Portfólio

Esta plataforma de e-commerce pode ser facilmente integrada ao seu portfólio pessoal:

1. Adicione capturas de ecrã das principais páginas e funcionalidades
2. Destaque as tecnologias utilizadas
3. Explique os desafios técnicos superados
4. Mencione as melhores práticas implementadas (autenticação segura, design responsivo, etc.)

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contacto

Para qualquer dúvida ou sugestão, entre em contacto através do seu perfil no GitHub ou LinkedIn.
