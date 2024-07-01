import { useEffect, useState } from "react";
import {
  ListGroup,
  Image,
  Dropdown,
  Modal,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { axiosInstance } from "../api/axios";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

const ChatList = ({ selectChat }) => {
  const { onlineUsers } = useSocket();
  const [chats, setChats] = useState([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changePasswordShow, setChangePasswordShow] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [searchTimer, setSearchTimer] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleChangePasswordClose = () => setChangePasswordShow(false);
  const handleChangePasswordShow = () => setChangePasswordShow(true);

  const fetchChats = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/users/");
      setChats(response.data?.data);
    } catch (error) {
      toast.error(error.response.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setValue("avatar", user?.avatar);
    setValue("fullName", user?.fullName);
    setValue("username", user?.username);
    setValue("email", user?.email);
    setValue("phone", user?.phone);
    fetchChats();
  }, []);

  const handleLogout = async () => {
    const toastId = toast.loading("Please wait...");
    try {
      const response = await axiosInstance.post("/api/v1/users/logout");
      toast.success(response.data?.message, { id: toastId });
      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error.response.data?.message || "Something went wrong.", {
        id: toastId,
      });
    }
  };

  const isActive = (userId) => onlineUsers.includes(userId);

  const onSubmit = async (data) => {
    setIsUpdatingProfile(true);
    const toastId = toast.loading("Please wait...");

    const formData = new FormData();
    formData.append("avatar", data.avatar[0] || user?.avatar);
    formData.append("fullName", data.fullName);
    formData.append("username", data.username);
    formData.append("email", data.email);
    formData.append("phone", data.phone);

    try {
      const response = await axiosInstance.patch(
        "/api/v1/users/update-profile",
        formData
      );
      toast.success(response.data?.message, { id: toastId });
      setUser(response.data?.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.", {
        id: toastId,
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePasswordSubmit = async (data) => {
    setIsUpdatingPassword(true);
    const toastId = toast.loading("Please wait...");

    try {
      const response = await axiosInstance.post(
        "/api/v1/users/change-password",
        { currentPassword: data.currentPassword, newPassword: data.newPassword }
      );
      setValue("currentPassword", "");
      setValue("newPassword", "");
      toast.success(response.data?.message, { id: toastId });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.", {
        id: toastId,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSearch = async (e) => {
    setIsLoading(true);
    const query = e.target.value;

    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    setSearchTimer(
      setTimeout(async () => {
        if (query) {
          try {
            const response = await axiosInstance.get(
              `/api/v1/users/search?query=${query}`
            );
            setChats(response.data?.data);
          } catch (error) {
            toast.error(
              error.response.data?.message || "Something went wrong."
            );
          } finally {
            setIsLoading(false);
          }
        } else {
          fetchChats();
        }
      }, 500)
    );
  };

  const handleChatClick = (chat) => {
    setActiveChatId(chat._id);
    selectChat(chat);
  };

  return (
    <>
      <div className="col-md-4 chat-list">
        <div className="d-flex align-items-center justify-content-between my-3">
          <div className="d-flex align-items-center">
            <Image
              roundedCircle
              width={40}
              height={40}
              className="mr-2"
              src={user?.avatar}
            />
            <div className="chat-info ms-2">
              <div className="name" style={{ width: "max-content" }}>
                {user?.fullName}
              </div>
            </div>
          </div>
          <Form.Control
            type="search"
            placeholder="Search Here..."
            className="mx-3"
            onChange={handleSearch}
          />
          <Dropdown>
            <Dropdown.Toggle size="sm">Settings</Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleShow}>Edit Profile</Dropdown.Item>
              <Dropdown.Item onClick={handleChangePasswordShow}>
                Change Password
              </Dropdown.Item>
              <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <ListGroup>
          {isLoading ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mb-0 ms-2">Please Wait...</p>
            </div>
          ) : chats.length > 0 ? (
            chats.map((chat) => (
              <ListGroup.Item
                key={chat._id}
                onClick={() => handleChatClick(chat)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    chat._id === activeChatId ? "#f0f0f0" : "white",
                  color: chat._id === activeChatId ? "#007bff" : "black",
                }}
              >
                <Image
                  src={chat.avatar}
                  roundedCircle
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <div className="chat-info">
                  <div className="name">{chat.fullName}</div>
                </div>
                <div className="active">
                  {isActive(chat._id) ? (
                    <b>Online</b>
                  ) : (
                    <span className="text-black">Offline</span>
                  )}
                </div>
              </ListGroup.Item>
            ))
          ) : (
            <div className="text-center">User not found.</div>
          )}
        </ListGroup>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3 text-center">
              <Image
                src={user?.avatar}
                roundedCircle
                width={100}
                height={100}
              />
            </div>
            <Form.Group className="mb-3">
              <Form.Label>Avatar</Form.Label>
              <Form.Control type="file" {...register("avatar")} />
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
            <Button
              type="submit"
              className="w-100"
              disabled={isUpdatingProfile}
            >
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={changePasswordShow} onHide={handleChangePasswordClose}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate onSubmit={handleSubmit(onChangePasswordSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                {...register("currentPassword", {
                  required: "Current Password is required.",
                  minLength: {
                    value: 6,
                    message:
                      "Current Password must have at least 6 characters.",
                  },
                })}
                isInvalid={errors.currentPassword}
              />
              {errors.currentPassword && (
                <Form.Control.Feedback type="invalid">
                  {errors.currentPassword.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
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
                isInvalid={errors.newPassword}
              />
              {errors.newPassword && (
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Button
              type="submit"
              className="w-100"
              disabled={isUpdatingPassword}
            >
              Submit
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ChatList;
