import { Modal, Text, Anchor, Button, Menu } from "@mantine/core";
import { useState, useEffect, useRef } from "react";
import { getUser } from "../services/auth";
import { logout } from "../services/auth";
import Loading from "../components/Loading";

import * as Icons from "lucide-react";
import Picker from "../components/Picker";

export default function ChatPage() {
  const [openedFirstTimeModal, setOpenedFirstTimeModal] = useState(true);
  const [userName, setUserName] = useState("Unknown?");
  const [message, setMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messageInputRef = useRef(null);

  const focusMessageInput = (event) => {
    if (event.target.closest("button")) {
      return;
    }

    messageInputRef.current?.focus();
  };

  const addToMessage = (value: string) => {
    setMessage((currentMessage) => `${currentMessage}${value}`);
    setPickerOpen(false);
    requestAnimationFrame(() => messageInputRef.current?.focus());
  };

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await logout();
      window.location.reload();
    } catch (error) {
      console.error("Failed to logout:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getUser();
        if (user) {
          const displayName = 
            user.user_metadata?.name || 
            user.user_metadata?.full_name || 
            user.email || 
            "User";
          setUserName(displayName);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }

    fetchUser();
  }, []);

    if (isLoading) {
      return <Loading isLoading={isLoading} />;
    }

  return (
    <div className="chat-page">
      <Modal
        className="first-time-modal"
        opened={openedFirstTimeModal}
        onClose={() => setOpenedFirstTimeModal(false)}
        title="Welcome to theCommons"
        centered
        closeOnClickOutside={false}
      >
        <Text className="chat-welcome-text">
          Welcome to theCommons! We&apos;re very excited to have you here.
        </Text>
        <Text className="chat-welcome-text">
          In order to DM someone, you&apos;ll need to join a server first.{" "}
          <Anchor
            href="https://example.com/stupidarticleonwhy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read Why &gt;&gt;&gt;
          </Anchor>
        </Text>
        <Text className="chat-welcome-directory-text">
          To find some servers, check out our server directory.
        </Text>
        <Button className="chat-directory-button">Open Server Directory</Button>
      </Modal>

      <div className="chat-layout">
        <div className="sidebar">
          <div className="current-server">
            <div className="server-info">
            <Text className="server-name">Current Server</Text>
            <Text className="server-address">172.0.0.1:5032</Text>
            </div>
            <Icons.Menu size={20} aria-hidden="true" className="server-menu-icon" />
          </div>
          <span className="separator"></span>
          <div className="channels-list">
            <Text className="channels-heading" size="sm">Channels</Text>
            <div className="channel">
              <Icons.Hash size={20} aria-hidden="true" />
              <Text size="sm">General</Text>
            </div>
                        <div className="channel">
              <Icons.Hash size={20} aria-hidden="true" />
              <Text size="sm">Not General</Text>
            </div>
          </div>
        </div>
        <div className="chat">
          <Text>Chat Area</Text>
          <div className="chat-body">
            <div className="message ping">
              <Text className="message-user">Example User</Text>
              <Text className="message-body">Hello, World! Blah Blah Blah Blah Blah</Text>
            </div>
          </div>
          <div className="chat-controls">
            {pickerOpen && (
              <Picker
                onEmojiSelect={addToMessage}
                onGifSelect={(gif) => addToMessage(gif.imageUrl)}
              />
            )}
            <div className="chat-input-container" onClick={focusMessageInput}>
              <button type="button" className="chat-icon-button" aria-label="Add attachment">
                <Icons.Plus size={20} aria-hidden="true" />
              </button>
              <input
                ref={messageInputRef}
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(event) => setMessage(event.currentTarget.value)}
              />
              <button
                type="button"
                className={`chat-icon-button${pickerOpen ? " is-active" : ""}`}
                aria-label="Open emoji and GIF picker"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((isOpen) => !isOpen)}
              >
                <Icons.Smile size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`chat-icon-button chat-send-button${message.trim() ? " is-active" : ""}`}
                aria-label="Send message"
              >
                <Icons.Send size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        <div id="user-list">
          <div className="user-menu-container">
            <Menu position="top-end" shadow="md" withinPortal>
              <Menu.Target>
                <button type="button" className="current-user" aria-label="Open user menu">
                  <div className="avatar"></div>
                  <div className="profile">
                    <Text>{userName}</Text>
                  </div>
                  <Icons.ChevronUp size={18} aria-hidden="true" />
                </button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{userName}</Menu.Label>
                <Menu.Item leftSection={<Icons.User size={16} aria-hidden="true" />}>Profile</Menu.Item>
                <Menu.Item leftSection={<Icons.Settings size={16} aria-hidden="true" />}>Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item onClick={handleLogout} color="red" leftSection={<Icons.LogOut size={16} aria-hidden="true" />}>Logout</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}
