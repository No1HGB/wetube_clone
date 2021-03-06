import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { localsMiddleware } from "./middlewares";
import apiRouter from "./routers/apiRouter";

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
//change current working directory
app.set("views", process.cwd() + "/src/views");
//cors problem
app.use((req, res, next) => {
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(logger);
//to help understanding forms to express
app.use(express.urlencoded({ extended: true }));
//to help understanding forms of Comment(string to json)
app.use(express.json());
//sessionMiddleware:save sessions to our db using connect-mongo
//read a explanation putting a cursor on options(secret,resave...)
const maxdate = 1000 * 60 * 60 * 24 * 365 * 5;
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: maxdate },
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
//ffmpeg config
app.use("/convert", express.static("node_modules/@ffmpeg/core/dist"));

app.use(flash());
app.use(localsMiddleware);
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
//static tells to express which file(folder) exposed
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
//api Router
app.use("/api", apiRouter);

export default app;
