// Código de acesso definido no deploy (variável de ambiente VITE_ACCESS_CODE na
// Vercel/Netlify). Como o app é 100% estático, isso é uma trava simples — dá pra
// distribuir esse código no e-mail de compra, mas não é segurança de verdade
// (alguém técnico consegue inspecionar o código-fonte e contornar). Pra travar
// acesso por comprador de forma robusta, é preciso um backend com autenticação.
export const CODIGO_ACESSO = (import.meta.env.VITE_ACCESS_CODE as string | undefined)?.trim() || "casaemordem";
