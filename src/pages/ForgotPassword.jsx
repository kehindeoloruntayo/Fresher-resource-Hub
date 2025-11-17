import React, { useState } from "react";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here deji will handle sending the reset link via backend API
    setSent(true);
  };

  return React.createElement(
    "div",
    { className: "forgot-container" },
    sent
      ? React.createElement(
          "div",
          { className: "success-box" },
          [
            React.createElement("h2", { key: "txt" }, "Reset Link Sent"),
            React.createElement(
              "p",
              { key: "p" },
              "If the email exists, a password reset link has been sent."
            )
          ]
        )
      : React.createElement(
          "form",
          { className: "forgot-box", onSubmit: handleSubmit },
          [
            React.createElement("h1", { key: "title" }, "Forgot Password"),

            React.createElement("input", {
              key: "email",
              type: "email",
              placeholder: "Enter your account email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              className: "forgot-input"
            }),

            React.createElement(
              "button",
              { key: "submit", className: "forgot-btn", type: "submit" },
              "Send Reset Link"
            )
          ]
        )
  );
}

export default ForgotPassword;