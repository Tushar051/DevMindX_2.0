// Quick OAuth2 debug test
console.log('Testing OAuth2 system...');

// Test basic auth endpoints
fetch('/api/auth/google')
  .then(response => {
    console.log('Google OAuth redirect status:', response.status);
    console.log('Google OAuth redirect URL:', response.url);
    return response;
  })
  .catch(err => console.error('Google OAuth error:', err));

fetch('/api/auth/github')
  .then(response => {
    console.log('GitHub OAuth redirect status:', response.status);
    console.log('GitHub OAuth redirect URL:', response.url);
    return response;
  })
  .catch(err => console.error('GitHub OAuth error:', err));

// Check if we're on a callback URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('token')) {
  console.log('OAuth callback detected with token:', urlParams.get('token'));
  console.log('User data:', urlParams.get('user'));
} else if (urlParams.get('error')) {
  console.log('OAuth error detected:', urlParams.get('error'));
} else {
  console.log('No OAuth callback parameters found');
}

console.log('Current localStorage token:', localStorage.getItem('devmindx_token'));
console.log('Current localStorage user:', localStorage.getItem('devmindx_user'));