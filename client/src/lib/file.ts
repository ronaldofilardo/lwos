export async function readAsBase64(file: File): Promise<string> {
  if (file.size === 0) {
    throw new Error("Arquivo vazio — selecione um arquivo válido.");
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result).split(",")[1];
      if (!result) {
        reject(new Error("Não foi possível processar o arquivo selecionado."));
      } else {
        resolve(result);
      }
    };
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}
