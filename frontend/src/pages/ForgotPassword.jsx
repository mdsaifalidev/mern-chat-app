import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Please wait...");

    try {
      const response = await axios.post(
        "/api/v1/users/reset-password-request",
        data
      );
      toast.success(response.data.message, { id: toastId });
      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    navigate("/", { replace: true });
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <Container>
        <Row>
          <Col md={4} className="m-auto">
            <div className="mb-3 text-center">
              <h2 className="mb-0">Forgot Password</h2>
            </div>
            <Form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white shadow-sm p-4 rounded"
            >
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,
                      message: "Invalid email address.",
                    },
                  })}
                  isInvalid={errors.email}
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid">
                    {errors.email.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Button type="submit" className="w-100 mb-3" disabled={isLoading}>
                Reset Password
              </Button>
              <div className="text-center">
                <Link to="/login">Back to Login</Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ForgotPassword;
