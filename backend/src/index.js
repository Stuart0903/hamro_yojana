import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});

