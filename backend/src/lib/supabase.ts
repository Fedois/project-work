import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error("Configurazione Supabase mancante");
}

export const supabaseStorage = createClient(
  supabaseUrl,
  supabaseSecretKey,
);