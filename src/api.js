// URL do backend. Defina VITE_API_URL no .env (local) ou na Vercel/Netlify (produção).
// Atenção: variáveis VITE_* ficam visíveis para qualquer visitante, então aqui
// só entram dados públicos como esta URL. NUNCA coloque senhas ou tokens.
export const API_URL = (
  import.meta.env.VITE_API_URL || "https://giufit-backend.onrender.com"
).replace(/\/$/, "");

// Converte a resposta do backend ({ opcoes: [{tamanho, preco}] }) para o formato
// que as telas usam. Aceita também o formato antigo (preco_250g, ...).
export function normalizarTamanhos(prato) {
  if (Array.isArray(prato.opcoes) && prato.opcoes.length > 0) {
    return prato.opcoes.map((o) => ({
      tamanho: o.tamanho,
      preco: Number(o.preco) || 0,
    }));
  }
  return [
    { tamanho: "250g", preco: Number(prato.preco_250g) || 0 },
    { tamanho: "350g", preco: Number(prato.preco_350g) || 0 },
    { tamanho: "500g", preco: Number(prato.preco_500g) || 0 },
  ].filter((t) => t.preco > 0);
}

// "foto_url" vem do backend como caminho relativo (/pratos/1/foto?v=123).
export const urlDaFoto = (prato) =>
  prato?.foto_url ? `${API_URL}${prato.foto_url}` : null;

export const moeda = (v) => {
  const n = Number(v);
  return (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};
