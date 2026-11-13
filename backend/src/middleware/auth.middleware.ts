import type { Request, Response, NextFunction } from "express";
import { getCurrentUserFromToken, refreshUserSession } from "../services/auth.service.js";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, setAuthCookies } from "../controllers/auth.controller.js";

/**
 * Middleware that authenticates the user from the session (cookie or Bearer token).
 * Attach the user profile to `res.locals.user`.
*/
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.[COOKIE_ACCESS_TOKEN];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.substring(7);
    }

    let user = token ? await getCurrentUserFromToken(token) : null;

    // If l'access token is not valid or expired, try the refresh with refresh token
    if (!user && req.cookies?.[COOKIE_REFRESH_TOKEN]) {
      const refreshed = await refreshUserSession(req.cookies[COOKIE_REFRESH_TOKEN]);
      if (refreshed?.session) {
        setAuthCookies(res, refreshed.session);
        user = refreshed.user;
      }
    }

    if (!user) {
      res.status(401).json({ status: "error", message: "Non autenticato o sessione scaduta" });
      return;
    }

    res.locals.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware that verify if user has LIBRARIAN or ADMIN role.
 * Must use it after `authenticate`.
 */
export function requireLibrarian(req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user;
  if (!user || (user.role !== "LIBRARIAN" && user.role !== "ADMIN")) {
    res.status(403).json({ status: "error", message: "Accesso negato: richiesto ruolo LIBRARIAN o ADMIN" });
    return;
  }
  next();
}

/**
 * Middleware that verify if user has logged.
 * Must use it after `authenticate`.
 */ 
export function requireUserLogged(req: Request, res: Response, next: NextFunction){
  const user = res.locals.user;
  if (!user) {
    res.status(401).json({ status: "error", message: "Devi essere loggato per accedere a questa pagina" });
    return;
  }
  next();
}
