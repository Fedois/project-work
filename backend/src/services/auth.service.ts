import { supabase } from "../lib/supabase.js";
import { prisma } from "../lib/prisma.js";

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export async function registerUser({ email, password, firstName, lastName }: RegisterDTO) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  // 1. Registrazione con Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      emailRedirectTo: `${process.env.VITE_FRONTEND_URL || "http://localhost:5173"}/login`,
      data: {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        fullName: `${trimmedFirstName} ${trimmedLastName}`.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }

  const authUser = data.user;
  if (!authUser) {
    throw new Error("Impossibile creare l'utente su Supabase");
  }

  // 2. Sincronizzazione nel database Prisma
  let dbUser = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        email: trimmedEmail,
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        role: "MEMBER",
      },
    });
  }

  const confirmationRequired = !data.session;

  return {
    status: "ok" as const,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
    },
    session: data.session,
    confirmationRequired,
  };
}

export async function loginUser({ email, password }: LoginDTO) {
  const trimmedEmail = email.trim().toLowerCase();

  // 1. Login tramite Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) {
    throw error;
  }

  const authUser = data.user;
  if (!authUser) {
    throw new Error("Utente non trovato");
  }

  // 2. Recupero o sincronizzazione con Prisma
  let dbUser = await prisma.user.findUnique({
    where: { email: trimmedEmail },
  });

  if (!dbUser) {
    const meta = authUser.user_metadata || {};
    dbUser = await prisma.user.create({
      data: {
        id: authUser.id,
        email: trimmedEmail,
        firstName: meta.firstName || trimmedEmail.split("@")[0],
        lastName: meta.lastName || "",
        role: "MEMBER",
      },
    });
  }

  return {
    status: "ok" as const,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
    },
    session: data.session,
  };
}

export async function getCurrentUserFromToken(accessToken: string) {
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  const authUser = data.user;
  const dbUser = authUser.email
    ? await prisma.user.findUnique({
        where: { email: authUser.email },
      })
    : null;

  if (dbUser) {
    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role,
    };
  }

  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    email: authUser.email || "",
    firstName: meta.firstName || (authUser.email ? authUser.email.split("@")[0] : ""),
    lastName: meta.lastName || "",
    role: "MEMBER",
  };
}

export async function logoutUser(accessToken?: string) {
  if (accessToken) {
    try {
      await supabase.auth.admin.signOut(accessToken);
    } catch {
      // Ignora errori di invalidazione server-side se il token è già scaduto
    }
  }
  return { status: "ok" as const };
}

export async function refreshUserSession(refreshToken: string) {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session || !data.user) {
    return null;
  }

  const authUser = data.user;
  const dbUser = authUser.email
    ? await prisma.user.findUnique({
        where: { email: authUser.email },
      })
    : null;

  const user = dbUser
    ? {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
      }
    : {
        id: authUser.id,
        email: authUser.email || "",
        firstName: authUser.user_metadata?.firstName || (authUser.email ? authUser.email.split("@")[0] : ""),
        lastName: authUser.user_metadata?.lastName || "",
        role: "MEMBER" as const,
      };

  return {
    user,
    session: data.session,
  };
}
