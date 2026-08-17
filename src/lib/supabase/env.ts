// `process.env.NEXT_PUBLIC_*` precisa aparecer como acesso literal (com ponto,
// não `process.env[nomeVariavel]`) em cada função exportada — é assim que o
// Next.js reconhece e embute o valor no bundle do navegador durante o build.
// Um acesso dinâmico funciona no servidor (que tem o process.env de verdade em
// tempo de execução), mas fica undefined no navegador, porque o bundler nunca
// consegue substituir uma chave calculada em tempo de execução.
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não configurada. Veja o README para configurar o Supabase.`,
    );
  }
  return value;
}

export const supabaseUrl = () => requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = () =>
  requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const supabaseServiceRoleKey = () =>
  requireEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
