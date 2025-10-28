// Configuration checker - logs current configuration
export function logConfiguration() {
  console.log('=== FRONTEND CONFIGURATION CHECK ===');
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET');
  console.log('Environment mode:', import.meta.env.MODE);
  console.log('Base URL from env:', import.meta.env.VITE_API_BASE_URL);
  
  const apiUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`;
  console.log('Final API URL:', apiUrl);
  
  return {
    apiUrl,
    env: import.meta.env.VITE_API_BASE_URL,
    mode: import.meta.env.MODE
  };
}

