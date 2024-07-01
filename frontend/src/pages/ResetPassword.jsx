import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { token } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Please wait...");

    try {
      const response = await axios.post(
        `/api/v1/users/reset-password/${token}`,
        data
      );
      toast.success(response.data.message, { id: toastId });
      navigate("/login", { replace: true });
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
              <h2 className="mb-0">Reset Password</h2>
            </div>
            <Form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white shadow-sm p-4 rounded"
            >
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  {...register("newPassword", {
                    required: "New Password is required.",
                    minLength: {
                      value: 6,
                      message: "New Password must have at least 6 characters.",
                    },
                  })}
                  isInvalid={errors.password}
                />
                {errors.newPassword && (
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Button type="submit" className="w-100" disabled={isLoading}>
                Submit
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ResetPassword;
