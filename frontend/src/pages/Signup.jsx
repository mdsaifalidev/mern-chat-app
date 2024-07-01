import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    const toastId = toast.loading("Please wait...");

    const formData = new FormData();
    formData.append("avatar", data.avatar[0]);
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("password", data.password);

    try {
      const response = await axios.post("/api/v1/users/register", formData);
      toast.success(response.data.message, { id: toastId });
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.", {
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
              <h2 className="mb-0">Create Account</h2>
            </div>
            <Form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white shadow-sm p-4 rounded"
            >
              {avatarPreview && (
                <div className="mb-3 text-center">
                  <Image
                    src={avatarPreview}
                    roundedCircle
                    width={100}
                    height={100}
                  />
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Avatar</Form.Label>
                <Form.Control
                  type="file"
                  {...register("avatar", {
                    required: "Avatar is required.",
                  })}
                  onChange={(e) =>
                    setAvatarPreview(URL.createObjectURL(e.target.files[0]))
                  }
                  isInvalid={errors.avatar}
                />
                {errors.avatar && (
                  <Form.Control.Feedback type="invalid">
                    {errors.avatar.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register("fullName", {
                    required: "Full Name is required.",
                  })}
                  isInvalid={errors.fullName}
                />
                {errors.fullName && (
                  <Form.Control.Feedback type="invalid">
                    {errors.fullName.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  {...register("username", {
                    required: "Username is required.",
                    minLength: {
                      value: 4,
                      message: "Username must have at least 4 characters.",
                    },
                  })}
                  isInvalid={errors.username}
                />
                {errors.username && (
                  <Form.Control.Feedback type="invalid">
                    {errors.username.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
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
              <Form.Group className="mb-3">
                <Form.Label>Phone number</Form.Label>
                <Form.Control
                  type="text"
                  {...register("phone", {
                    required: "Phone number is required.",
                    minLength: {
                      value: 10,
                      message: "Invalid phone number.",
                    },
                    maxLength: {
                      value: 10,
                      message: "Invalid phone number.",
                    },
                  })}
                  isInvalid={errors.phone}
                />
                {errors.phone && (
                  <Form.Control.Feedback type="invalid">
                    {errors.phone.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  {...register("password", {
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password must have at least 6 characters.",
                    },
                  })}
                  isInvalid={errors.password}
                />
                {errors.password && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password.message}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <Button type="submit" className="w-100 mb-3" disabled={isLoading}>
                Signup
              </Button>
              <div className="text-center">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signup;
