import { useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiLoader, FiMail, FiSend, FiUser } from "react-icons/fi";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    // Hits the Vercel serverless function at /api/contact, which holds the
    // Gmail App Password server-side and sends both the owner notification
    // and the visitor confirmation. Only works when deployed on Vercel (or
    // running `vercel dev` locally) — a plain `vite` dev server has no /api.
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Request failed");
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong sending that — please email me directly instead.");
    }
  };

  if (status === "success") {
    return (
      <div className="contact-form__done" role="status">
        <FiCheckCircle className="contact-form__done-icon" />
        <p>
          Thanks{name ? `, ${name}` : ""} — your message is on its way.
          {email && (
            <>
              {" "}Check <strong>{email}</strong> for a confirmation — I'll reply from there soon.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <label className="contact-form__field">
          <span><FiUser /> Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </label>
        <label className="contact-form__field">
          <span><FiMail /> Your email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            required
          />
        </label>
      </div>

      <label className="contact-form__field contact-form__field--message">
        <span>Message</span>
        <textarea
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you building, or what role are you hiring for?"
          rows={4}
          required
        />
      </label>

      {status === "error" && (
        <p className="contact-form__error">
          <FiAlertCircle /> {errorMsg}
        </p>
      )}

      <button className="button button--primary contact-form__submit" type="submit" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            <FiLoader className="contact-form__spinner" /> Sending…
          </>
        ) : (
          <>
            <FiSend /> Send message
          </>
        )}
      </button>
    </form>
  );
}
