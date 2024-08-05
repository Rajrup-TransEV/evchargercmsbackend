import express from 'express';
import passport from 'passport';
import cookieSession from 'cookie-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [process.env.COOKIE_SECRET]
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const existingUser = await prisma.user.findUnique({ where: { email: profile.emails[0].value } });
  if (existingUser) {
    return done(null, existingUser);
  }
  const newUser = await prisma.user.create({
    data: {
      email: profile.emails[0].value,
      name: profile.displayName
    }
  });
  done(null, newUser);
}));

app.get('/', (req, res) => {
  res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/auth/failure',
  successRedirect: '/'
}));

app.get('/auth/failure', (req, res) => {
  res.send('Failed to login');
});

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});
