function handleCredentialResponse(response) {
  console.log("Google Token:", response.credential);

  // Decode user data
  const userInfo = parseJwt(response.credential);
  console.log("User Info:", userInfo);

  // Store user info in browser (optional)
  localStorage.setItem("user", JSON.stringify(userInfo));

  // ✅ Show welcome message
  alert(`Welcome ${userInfo.name}! Redirecting to homepage...`);

  // ✅ Redirect to index.html after 1.5 seconds
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

// Decode Google JWT Token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}
