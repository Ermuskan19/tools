export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function saveBytes(bytes, name, mime = 'application/pdf') {
  saveBlob(new Blob([bytes], { type: mime }), name);
}

export function baseName(name, ext) {
  return String(name || 'document').replace(new RegExp(`\\.${ext}$`, 'i'), '');
}

export function revokeUrl(url) {
  if (url && String(url).startsWith('blob:')) URL.revokeObjectURL(url);
}
