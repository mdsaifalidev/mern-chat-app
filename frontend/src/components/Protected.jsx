import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const Protected = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mb-0 ms-2">Please Wait...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace={true}></Navigate>;
  }

  return children;
};

export default Protected;
