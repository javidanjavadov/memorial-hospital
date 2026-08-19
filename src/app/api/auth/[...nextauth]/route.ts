import { handlers } from "@/auth"

// Auth.js mounts its whole flow here: /api/auth/signin, /callback/google,
// /session, /signout. The redirect URI registered in Google Cloud Console must
// point at /api/auth/callback/google.
export const { GET, POST } = handlers
