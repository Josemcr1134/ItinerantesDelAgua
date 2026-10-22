/** Descarga un archivo recibido de la API con el nombre indicado. */
export function saveFile(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  // Se libera después de que el navegador empezó la descarga.
  setTimeout(() => URL.revokeObjectURL(url));
}
