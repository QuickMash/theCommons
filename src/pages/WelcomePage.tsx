import { useState, useEffect } from "react";
import {
  Anchor,
  Button,
  Box,
  Group,
  Modal,
  Select,
  Stepper,
  Text,
} from "@mantine/core";
import { Editor } from "@monaco-editor/react";
import { useDisclosure } from "@mantine/hooks";
import * as Icons from "lucide-react";
import { customThemes } from "../hooks/customTheme";
import { setSession, getUser } from "../services/auth";
import Loading from "../components/Loading";

export default function WelcomePage({ onNavigate }) {
  const [page, setPage] = useState(0);
  const [themePreference, setThemePreference] = useState("system");
  const [languagePreference, setLanguagePreference] = useState("en");
  const [css, setCss] = useState("/* Write Css Here */");
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [opened, { open, close }] = useDisclosure(false);

  const { selectData, getTheme } = customThemes();

  const nextPage = () => {
    if (page < 2) {
      setPage((currentPage) => currentPage + 1);
    } else {
      onNavigate("login");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const data = await window.electronAPI.getLoginData();
        if (data && data.session) {
          const { access_token, refresh_token } = data.session;
          await setSession(access_token, refresh_token);
          const user = await getUser();

          if (user != null && isMounted) {
            onNavigate("chat");
            return;
          }
        }
      } catch (error) {
        console.error("Error setting session:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [onNavigate]);

  const prevPage = () => setPage((currentPage) => Math.max(0, currentPage - 1));

  if (isLoading) {
    return <Loading isLoading={isLoading} />;
  }

  return (
    <div className="screen">
      <p>Complete the setup to get started.</p>
      
      <Modal
        className="code-editor-modal"
        opened={opened}
        onClose={close}
        title="Custom CSS"
      >
        <Box
          style={{
            borderRadius: "var(--mantine-radius-default)",
            overflow: "hidden",
          }}
        >
          <Select
            className="custom-theme-select"
            label="Select a theme"
            data={selectData}
            value={selectedTheme}
            onChange={setSelectedTheme}
          />
          <Button
            className="save-btn"
            onClick={() => {
              console.log("Saved CSS:", css);
            }}
          >
            Save
          </Button>
          <Editor
            className="monaco-editor"
            height="50vh"
            theme="vs-dark"
            path="custom.css"
            defaultLanguage="css"
            value={css}
            onChange={(value) => setCss(value || "")}
          />
        </Box>
      </Modal>

      <Stepper
        className="welcome-stepper"
        active={page}
        onStepClick={setPage}
        classNames={{
          stepIcon: "welcome-step-icon",
          step: "welcome-step",
          separator: "welcome-step-separator",
          stepLabel: "welcome-step-label",
          stepDescription: "welcome-step-description",
          content: "welcome-step-content",
        }}
      >
        <Stepper.Step
          className="welcomestepper"
          label="Welcome"
          description="Lets get started."
        >
          <h2> Welcome to theCommons.dev!</h2>
          <p>Lets get you set up.</p>

          <Select
            label="Language"
            value={languagePreference}
            onChange={setLanguagePreference}
            data={[
              { value: "en", label: "English" },
              { value: "es", label: "Español" },
              { value: "fr", label: "Français" },
            ]}
          />
        </Stepper.Step>
        <Stepper.Step
          className="welcomestepper"
          label="Theme"
          description="Make it yours."
        >
          <Select
            label="Theme"
            value={themePreference}
            onChange={setThemePreference}
            data={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            classNames={{
              input: "theme-select-input",
              label: "theme-select-label",
              dropdown: "theme-select-dropdown",
              option: "theme-select-option",
            }}
          />
          <Text className="custom-theme-text" mt={0}>
            Or{" "}
            <Anchor
              className="custom-theme-link"
              size="sm"
              component="button"
              type="button"
              onClick={open}
            >
              <Icons.NotebookPen size="1em" strokeWidth={2} /> Make Your Own
            </Anchor>
          </Text>
        </Stepper.Step>
        <Stepper.Step
          className="welcomestepper"
          label="Account"
          description="Your passport."
        >
          <h2>Account Setup</h2>
          <div className="account-pick"></div>
        </Stepper.Step>
      </Stepper>
      <Group className="welcome-navigation">
        <Group className="LoginGroup">
          <Button id="back" onClick={prevPage} disabled={page === 0}>
            <Icons.ArrowLeft size="1em" strokeWidth={2} aria-hidden="true" />{" "}
            Back
          </Button>
          {page === 2 && (
            <Button
              className="register-btn"
              onClick={() => onNavigate("register")}
            >
              <span className="account-icon">
                <Icons.UserPlus size="1em" strokeWidth={2} aria-hidden="true" />
              </span>
              Register
            </Button>
          )}
        </Group>
        {page === 2 ? (
          <Button className="login-btn" onClick={() => onNavigate("login")}>
            <span className="account-icon">
              <Icons.LogIn size="1em" strokeWidth={2} aria-hidden="true" />
            </span>
            Continue to login
          </Button>
        ) : (
          <Button id="next" onClick={nextPage}>
            Next
            <Icons.ArrowRight size="1em" strokeWidth={2} aria-hidden="true" />
          </Button>
        )}
      </Group>
    </div>
  );
}
