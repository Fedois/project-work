import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";

const COOKIE_ACCESS_TOKEN = "sb_access_token";
const COOKIE_REFRESH_TOKEN = "sb_refresh_token";

function setAuthCookies(res: Response, session: { access_token: string; refresh_token?: string; expires_in?: number }) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_ACCESS_TOKEN, session.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: (session.expires_in ?? 3600 * 24 * 7) * 1000,
    path: "/",
  });

  if (session.refresh_token) {
    res.cookie(COOKIE_REFRESH_TOKEN, session.refresh_token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 30 * 24 * 3600 * 1000, // 30 giorni
      path: "/",
    });
  }
}

function clearAuthCookies(res: Response) {
  res.clearCookie(COOKIE_ACCESS_TOKEN, { path: "/" });
  res.clearCookie(COOKIE_REFRESH_TOKEN, { path: "/" });
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        status: "error",
        message: "Tutti i campi (nome, cognome, email, password) sono obbligatori",
      });
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({
        status: "error",
        message: "La password deve contenere almeno 6 caratteri",
      });
      return;
    }

    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
    });

    if (result.session) {
      setAuthCookies(res, result.session);
    }

    res.status(201).json({
      status: "ok",
      user: result.user,
      confirmationRequired: result.confirmationRequired,
    });
  } catch (error: any) {
    res.status(400).json({
      status: "error",
      message: error?.message || "Errore durante la registrazione",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: "error",
        message: "Email e password sono obbligatorie",
      });
      return;
    }

    const result = await authService.loginUser({ email, password });

    if (result.session) {
      setAuthCookies(res, result.session);
    }

    res.json({
      status: "ok",
      user: result.user,
    });
  } catch (error: any) {
    res.status(401).json({
      status: "error",
      message: error?.message || "Credenziali non valide",
    });
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.[COOKIE_ACCESS_TOKEN] ||
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.substring(7)
        : undefined);

    await authService.logoutUser(token);
    clearAuthCookies(res);

    res.json({ status: "ok", message: "Logout effettuato con successo" });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[COOKIE_ACCESS_TOKEN];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      res.status(401).json({ status: "error", message: "Non autenticato" });
      return;
    }

    let user = await authService.getCurrentUserFromToken(token);

    // Se l'access token è scaduto, tenta il refresh con il cookie di refresh
    if (!user && req.cookies?.[COOKIE_REFRESH_TOKEN]) {
      const refreshed = await authService.refreshUserSession(req.cookies[COOKIE_REFRESH_TOKEN]);
      if (refreshed?.session) {
        setAuthCookies(res, refreshed.session);
        user = refreshed.user;
      }
    }

    if (!user) {
      clearAuthCookies(res);
      res.status(401).json({ status: "error", message: "Sessione non valida o scaduta" });
      return;
    }

    res.json({ status: "ok", user });
  } catch (error) {
    next(error);
  }
}
