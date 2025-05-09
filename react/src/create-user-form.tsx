import {
  CSSProperties,
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from "react";

interface CreateUserFormProps {
  setUserWasCreated: (value: boolean) => void;
}

interface PasswordValidation {
  test: (password: string) => boolean;
  message: string;
}

export function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract token from URL path
  const token = window.location.pathname.split("/").pop();
  if (!token) throw new Error("Authentication token not found in URL");

  // Password validation criteria
  const passwordValidations: PasswordValidation[] = [
    {
      test: (p) => p.length >= 10,
      message: "Password must be at least 10 characters long",
    },
    {
      test: (p) => p.length <= 24,
      message: "Password must be at most 24 characters long",
    },
    {
      test: (p) => !p.includes(" "),
      message: "Password cannot contain spaces",
    },
    {
      test: (p) => /\d/.test(p),
      message: "Password must contain at least one number",
    },
    {
      test: (p) => /[A-Z]/.test(p),
      message: "Password must contain at least one uppercase letter",
    },
    {
      test: (p) => /[a-z]/.test(p),
      message: "Password must contain at least one lowercase letter",
    },
  ];

  // Real-time validation
  useEffect(() => {
    const errors: string[] = [];

    if (!username.trim()) errors.push("Username is required");

    passwordValidations.forEach(({ test, message }) => {
      if (!test(password)) errors.push(message);
    });

    setValidationErrors(errors);
  }, [username, password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");

    if (validationErrors.length > 0 || !username.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        setUserWasCreated(true);
      } else {
        const errorData = await response.json();
        handleApiError(response.status, errorData.message);
      }
    } catch (error) {
      handleApiError(500, "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiError = (status: number, message: string) => {
    switch (status) {
      case 401:
      case 403:
        setApiError("Not authenticated to access this resource.");
        break;
      case 500:
        setApiError(
          message.includes("not allowed")
            ? "Sorry, the entered password is not allowed, please try a different one."
            : "Something went wrong, please try again."
        );
        break;
      default:
        setApiError("Something went wrong, please try again.");
    }
  };

  return (
    <div style={formWrapper}>
      <form style={form} onSubmit={handleSubmit}>
        <label style={formLabel} htmlFor="username">
          Username
        </label>
        <input
          style={formInput}
          id="username"
          type="text"
          value={username}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setUsername(e.target.value)
          }
          aria-invalid={!!validationErrors.find((e) => e.includes("Username"))}
        />

        <label style={formLabel} htmlFor="password">
          Password
        </label>
        <input
          style={formInput}
          id="password"
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
          aria-invalid={validationErrors.length > 0}
        />

        {validationErrors.length > 0 && (
          <ul style={errorList}>
            {validationErrors.map((error) => (
              <li key={error} style={errorItem}>
                {error}
              </li>
            ))}
          </ul>
        )}

        {apiError && <div style={apiErrorStyle}>{apiError}</div>}

        <button
          style={formButton}
          type="submit"
          disabled={
            validationErrors.length > 0 || isSubmitting || !username.trim()
          }
        >
          {isSubmitting ? "Submitting..." : "Create User"}
        </button>
      </form>
    </div>
  );
}

// Style definitions
const formWrapper: CSSProperties = {
  maxWidth: "500px",
  width: "80%",
  backgroundColor: "#efeef5",
  padding: "24px",
  borderRadius: "8px",
};

const form: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: "none",
  padding: "8px 16px",
  height: "40px",
  fontSize: "14px",
  backgroundColor: "#f8f7fa",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  borderRadius: "4px",
};

const formButton: CSSProperties = {
  outline: "none",
  borderRadius: "4px",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  backgroundColor: "#7135d2",
  color: "white",
  fontSize: "16px",
  fontWeight: 500,
  height: "40px",
  padding: "0 8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "8px",
  alignSelf: "flex-end",
  cursor: "pointer",
};

const errorList: CSSProperties = {
  listStyle: "disc",
  paddingLeft: "24px",
  color: "#dc3545",
  margin: "8px 0",
};

const errorItem: CSSProperties = {
  margin: "4px 0",
};

const apiErrorStyle: CSSProperties = {
  color: "#dc3545",
  margin: "8px 0",
};
