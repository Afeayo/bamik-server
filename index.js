const express = require("express");
const path = require('path');
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const cors = require("cors");
const auth = require("./routes/auth");
const pay = require("./routes/pay");
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://bamilklens.com.ng",
  "https://bamlens-back-end.onrender.com",
  "https://www.bamilklens.com.ng",
  "https://bamilklen.onrender.com"
];


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,  // Ensure cookies are sent
  })
);

/*app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`Blocked CORS request from: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  })
);
*/
// Debugging: Ensure environment variable is loaded


/*
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);

app.use(session({
  secret: process.env.SESSION_SECRET || "Balabulu",
  resave: false,
  saveUninitialized: false,  // Ensures only active sessions are saved
  store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60,  // Session expiry (7 days)
      autoRemove: "native"
  }),
  cookie: { maxAge: 10 * 60 * 1000 } // 10 minutes expiry
}));



// Debugging session storage
app.use((req, res, next) => {
  console.log("Session Data:", req.session);
  next();
});
*/

app.use(session({
  secret: process.env.SESSION_SECRET || "Balabulu",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
  })
}));


// Health Check Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/auth", auth);
app.use("/register", pay);

// Catch-all route for non-existent endpoints
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
