import { useState } from "react";
import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { login } from "../services/auth";

export default function LoginPage({ onLoginSuccess, onNavigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setResponse("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    setResponse("");

    try {
      const data = await login(email.trim(), password);

      onLoginSuccess(data.user);
    } catch (error) {
      setResponse(
        error.message || "Unable to login. Check your credentials.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-container" className="container">
      <h1>Welcome back.</h1>
      <p>Sign in to your account</p>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
          />
          <Button type="submit" loading={isSubmitting}>
            Sign in
          </Button>
          <Text size="sm" c="red">{response}</Text>
          <Button
            type="button"
            className="secondary-action"
            variant="subtle"
            size="xs"
            onClick={() => onNavigate("register")}
          >
            Need an account? Register
          </Button>
          <Button
            type="button"
            className="secondary-action"
            variant="subtle"
            size="xs"
            onClick={() => onNavigate("welcome")}
          >
            Return to Setup
          </Button>
        </Stack>
      </form>
    </div>
  );
}
