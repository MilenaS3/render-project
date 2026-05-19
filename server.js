const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Persistência em memória
let products = [
  { id: '1', name: 'Laptop Gamer', price: 4500.00 },
  { id: '2', name: 'Mouse Sem Fio', price: 150.00 }
];

// --- ROTAS DA API ---

// GET todos os produtos
app.get('/produtos', (req, res) => {
  res.status(200).json(products);
});

// GET produto por ID
app.get('/produtos/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ message: 'Produto não encontrado.' });
  }
});

// POST novo produto
app.post('/produtos', (req, res) => {
  const { name, price } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
  }
  const newProduct = { 
    id: String(Date.now()), // Usando timestamp para IDs únicos simples
    name, 
    price: Number(price) 
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT atualizar produto
app.put('/produtos/:id', (req, res) => {
  const { name, price } = req.body;
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex !== -1) {
    products[productIndex] = { 
      ...products[productIndex], 
      name: name || products[productIndex].name, 
      price: price !== undefined ? Number(price) : products[productIndex].price 
    };
    res.status(200).json(products[productIndex]);
  } else {
    res.status(404).json({ message: 'Produto não encontrado.' });
  }
});

// DELETE produto
app.delete('/produtos/:id', (req, res) => {
  const initialLength = products.length;
  products = products.filter(p => p.id !== req.params.id);

  if (products.length < initialLength) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Produto não encontrado.' });
  }
});

// Rota principal serve o index.html (fallback para o static)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
