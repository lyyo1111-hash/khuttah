import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ehafhbclugzctjolpqor.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoYWZoYmNsdWd6Y3Rqb2xwcW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNDY2OTAsImV4cCI6MjA5MzkyMjY5MH0.oXTWoHj-xPSrZk5kVXY_W5Wr5TcWltLjPuy8eWXqcZI";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);