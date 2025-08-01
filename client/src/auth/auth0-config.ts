export const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'joe-estrella.us.auth0.com',
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'Wd1t5JLE8OMxtFV0qv2IZ2URagwb0S7V',
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || 'https://joe-estrella.us.auth0.com/api/v2/',
    scope: 'openid profile email'
  }
}; 