import { useState } from "react";
import {
  Button,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { registerUser } from "../services/auth";

interface RegisterPageProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess?: (user: unknown) => void;
}

export default function RegisterPage({ onRegisterSuccess, onNavigate }: RegisterPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setResponse("Please enter both an email and a password.");
      return;
    }

    setIsSubmitting(true);
    setResponse("");

    try {
      const data = await registerUser(email, password);
      
      // If reg succeeds login, may be insecure tho
      if (onRegisterSuccess) {
        onRegisterSuccess(data.user);
      } else {
        onNavigate("login");
      }
    } catch (error) {
      setResponse(
        error.message || "Unable to create an account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="register-container" className="container">
      <h1>Create Account</h1>
      <p>Register a new account to get started.</p>
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
          <Button type="submit" loading={isSubmitting} mt="md">
            Register
          </Button>
          <Text size="sm" c="red">{response}</Text>
          <Button
            type="button"
            className="secondary-action"
            variant="subtle"
            size="xs"
            onClick={() => onNavigate("login")}
          >
            Already have an account? Sign in
          </Button>
        </Stack>
      </form>
    </div>
  );
}
