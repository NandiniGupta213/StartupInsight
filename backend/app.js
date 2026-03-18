import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import analyzeRoutes from "./routes/analyze.js"
import compareRoutes from "./routes/compare.js"
import relatedRoutes from "./routes/relatedStartups.js"
import marketTrendsRoutes from "./routes/marketTrends.js"
import workflowRoutes from "./routes/workflow.js"
import UserRoutes from "./routes/user.js"


dotenv.config({
    path: './.env'
});

const app = express();

app.use(cors({ 
    origin: 'http://localhost:3000',
    credentials: true 
}));

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));

app.use("/user", UserRoutes);

app.use('/api/startup', analyzeRoutes);
app.use('/api/startup', relatedRoutes);
app.use('/api/open', compareRoutes); 
app.use('/api/market', marketTrendsRoutes); 
app.use('/api/workflow', workflowRoutes);







export default app;