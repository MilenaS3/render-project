const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let products = [
  { id: '1', name: 'Laptop', price: 1200.00, description: 'Powerful laptop for development' },
  { id: '2', name: 'Mouse', price: 25.00, description: 'Wireless ergonomic mouse' }
];

// Rota de status
app.get('/', (req, res) => {
  res.status(200).send('API de Produtos está online!');
});

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
    res.status(404).send('Produto não encontrado.');
  }
});

// POST novo produto
app.post('/produtos', (req, res) => {
  const { name, price, description } = req.body;
  if (!name || !price) {
    return res.status(400).send('Nome e preço são obrigatórios.');
  }
  const newProduct = { id: String(products.length + 1), name, price, description };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT atualizar produto
app.put('/produtos/:id', (req, res) => {
  const { name, price, description } = req.body;
  const productIndex = products.findIndex(p => p.id === req.params.id);

  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], name, price, description };
    res.status(200).json(products[productIndex]);
  } else {
    res.status(404).send('Produto não encontrado.');
  }
});

// DELETE produto
app.delete('/produtos/:id', (req, res) => {
  const initialLength = products.length;
  products = products.filter(p => p.id !== req.params.id);

  if (products.length < initialLength) {
    res.status(204).send(); // No Content
  } else {
    res.status(404).send('Produto não encontrado.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
