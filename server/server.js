import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB and Cloudinary
await connectDB();
await connectCloudinary();

// ✅ Allowed Origins (Frontend URLs)
const allowedOrigins = [
  'http://localhost:5173',                   // for local development
  'https://grocery-store-89q3.vercel.app',   // your deployed frontend on Vercel
];

// ✅ Stripe webhook route (must come before express.json middleware)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// ✅ Test route
app.get('/', (req, res) => res.send('API is Working 🚀'));

// ✅ Application Routes
app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);

// ✅ Start Server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
