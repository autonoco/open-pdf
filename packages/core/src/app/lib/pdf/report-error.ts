export async function reportDocumentError(
  documentId: string,
  operation: 'render' | 'export',
  error: unknown,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  try {
    const response = await fetch('/__host/client-errors', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId,
        operation,
        message: message.slice(0, 2048) || 'Unknown error',
      }),
      keepalive: true,
    });
    // Standalone open-pdf servers do not provide the optional hosted telemetry endpoint.
    if (!response.ok && response.status !== 404) {
      console.warn(`[open-pdf] error report rejected (${response.status})`);
    }
  } catch (failure) {
    console.warn('[open-pdf] error report failed:', failure);
  }
}
