// Optional Firestore logger stub. Disabled by default.
// To enable: initialize Firebase elsewhere and replace `log` implementation.

async function log(entry) {
  // entry: { userMessage, botResponse, mode, timestamp }
  // No-op by default to preserve privacy. Implement when required.
  return Promise.resolve()
}

export default { log }
