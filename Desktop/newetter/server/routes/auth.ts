import { RequestHandler } from "express";

// Google OAuth configuration
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || "your-google-client-id";
const GOOGLE_CLIENT_SECRET =
  process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret";
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:8080/auth/google/callback";

// In-memory user storage (replace with database in production)
const users = new Map();

// Helper function to generate Google OAuth URL
function getGoogleLoginUrl(state: string = "login"): string {
  const baseUrl = "https://accounts.google.com/oauth/authorize";
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    scope: "openid email profile",
    response_type: "code",
    state: state,
    access_type: "offline",
    prompt: "consent",
  });

  return `${baseUrl}?${params.toString()}`;
}

// Helper function to exchange code for tokens
async function exchangeCodeForTokens(code: string) {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: GOOGLE_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: GOOGLE_REDIRECT_URI,
  });

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  return response.json();
}

// Helper function to get user info from Google
async function getUserInfo(accessToken: string) {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to get user info");
  }

  return response.json();
}

// Route to initiate Google OAuth login
export const googleLogin: RequestHandler = (req, res) => {
  const state = (req.query.state as string) || "login";
  const googleAuthUrl = getGoogleLoginUrl(state);
  res.redirect(googleAuthUrl);
};

// Route to handle Google OAuth callback
export const googleCallback: RequestHandler = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error("OAuth error:", error);
      return res.redirect("/?error=oauth_failed");
    }

    if (!code) {
      return res.redirect("/?error=missing_code");
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code as string);

    // Get user info
    const userInfo = await getUserInfo(tokens.access_token);

    // Create or update user
    const userId = userInfo.id;
    const user = {
      id: userId,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      verified_email: userInfo.verified_email,
      created_at: users.has(userId)
        ? users.get(userId).created_at
        : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.set(userId, user);

    // Generate a simple session token (use JWT or proper session management in production)
    const sessionToken = Buffer.from(
      JSON.stringify({ userId, email: userInfo.email }),
    ).toString("base64");

    // Redirect to frontend with success and user data
    const redirectUrl =
      state === "signup"
        ? `/?auth=success&type=signup&token=${sessionToken}&user=${encodeURIComponent(JSON.stringify(user))}`
        : `/?auth=success&type=login&token=${sessionToken}&user=${encodeURIComponent(JSON.stringify(user))}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect("/?error=auth_failed");
  }
};

// Route to get current user (for authenticated requests)
export const getCurrentUser: RequestHandler = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authentication token provided" });
  }

  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(Buffer.from(token, "base64").toString());
    const user = users.get(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Route to logout
export const logout: RequestHandler = (req, res) => {
  // In a real app, you'd invalidate the session/token
  res.json({ message: "Logged out successfully" });
};
