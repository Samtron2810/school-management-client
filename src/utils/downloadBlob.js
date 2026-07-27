// Triggers a browser "Save As" for a blob response from an authenticated
// axios call (api.js attaches the Bearer token; a plain <a href> to the
// API URL would be unauthenticated and fail with 401).
export function downloadBlobResponse(response, fallbackFilename) {
  const blob = response?.data;
  if (!blob) return;

  const disposition = response.headers?.["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || fallbackFilename;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default downloadBlobResponse;
