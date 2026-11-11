// Prepara a foto escolhida na galeria do celular: corrige a rotação, reduz para
// no máximo 1000px e converte para JPEG leve (o backend aceita até 600 KB).
const LADO_MAX = 1000;
const LIMITE_BYTES = 560 * 1024;

export async function prepararFoto(arquivo) {
  if (!arquivo || !arquivo.type.startsWith("image/")) {
    throw new Error("Escolha um arquivo de imagem.");
  }

  let bitmap;
  try {
    // imageOrientation: respeita a rotação das fotos tiradas em pé no celular
    bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Não consegui abrir essa imagem. Tente uma foto JPG ou PNG.");
  }

  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // PNG com fundo transparente vira fundo branco
  ctx.fillRect(0, 0, largura, altura);
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close?.();

  const paraBlob = (q) =>
    new Promise((ok, erro) =>
      canvas.toBlob((b) => (b ? ok(b) : erro(new Error("Falha ao converter a imagem."))), "image/jpeg", q),
    );

  let blob = null;
  for (const qualidade of [0.85, 0.75, 0.65, 0.5]) {
    blob = await paraBlob(qualidade);
    if (blob.size <= LIMITE_BYTES) break;
  }
  if (blob.size > LIMITE_BYTES) throw new Error("A imagem ficou grande demais. Tente outra foto.");
  return blob;
}
