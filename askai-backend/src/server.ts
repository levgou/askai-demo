/**
 * Setup express server.
 */

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'jet-logger';

import 'express-async-errors';

import BaseRouter from '@src/routes/api';
import Paths from '@src/routes/constants/Paths';

import EnvVars from '@src/constants/EnvVars';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';

import { NodeEnvs } from '@src/constants/misc';
import { RouteError } from '@src/other/classes';
const cors = require("cors");


// **** Variables **** //

const app = express();


// **** Setup **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(EnvVars.CookieProps.Secret));
app.use(cors())

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.Dev) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.Production) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths.Base, BaseRouter);

// Add error handler
app.use((
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (EnvVars.NodeEnv !== NodeEnvs.Test) {
    logger.err(err, true);
  }
  let status = HttpStatusCodes.BAD_REQUEST;
  if (err instanceof RouteError) {
    status = err.status;
  }
  return res.status(status).json({ error: err.message });
});


// ** Front-End Content ** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));


// ------------------------------------------------
// ------------------------------------------------
// ------------------------------------------------


const getToken = async () => {

  const apiRes = await fetch('https://chunk-holder.hw.ask-ai.co//auth/generate-token', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-API-Key': 'd486a94c-29f4-453a-a822-f909a97dbfa7',
    },
  })

  const resJson = await apiRes.json()
  return resJson.token as string
}

const getChunkContent = async (chunkId: string, token: string) => {
  const apiRes = await fetch(`https://chunk-holder.hw.ask-ai.co/chunks/${chunkId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      'Authorization': token,
    },
  })

  const resJson = await apiRes.json()
  return resJson
}

const getChunks = async () => {
  const apiRes = await fetch('https://inference-runner.hw.ask-ai.co/ask', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'X-API-Key': '7c4e87e6-aef8-467a-b43a-4f80147453bf',
    },
    body: JSON.stringify({
      "question": "What is the meaning of life?"
    })
  })

  const resJson = await apiRes.json()
  return resJson.chunks as {
    chunkId: string,
    confidence: number
  }[]
}

// Nav to login pg by default
app.get('/', async (_: Request, res: Response) => {
  console.log('Got new request: ')
  const chunks = await getChunks()
  const confidentChunkgs = chunks.filter(c => c.confidence >= 70)

  const token = await getToken()

  const chunkContents = await Promise.all(confidentChunkgs.map(c => getChunkContent(c.chunkId, token)))
  console.log(chunkContents)
  res.send(JSON.stringify(chunkContents))
});

// Redirect to login if not logged in.
app.get('/users', (req: Request, res: Response) => {
  const jwt = req.signedCookies[EnvVars.CookieProps.Key];
  if (!jwt) {
    res.redirect('/');
  } else {
    res.sendFile('users.html', { root: viewsDir });
  }
});


// **** Export default **** //

export default app;
