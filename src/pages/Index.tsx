import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard or auth based on auth state
  const isAuthenticated = localStorage.getItem('ynote-auth') === 'true';
  
  return isAuthenticated 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/auth" replace />;
};

export default Index;