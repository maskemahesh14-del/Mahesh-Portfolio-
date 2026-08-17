"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./page.module.css";

/**
 * No backend yet: submitting composes a mailto: draft so the form is honest
 * about where the message goes rather than silently discarding it.
 */
const RECIPIENT = "maheshmaske840@gmail.com";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio enquiry — ${name || "hello"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:${RECIPIENT}?subject=${subject}&body=${body}`;
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-name">
          Name
        </label>
        <input
          id="contact-name"
          className={styles.input}
          type="text"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          className={styles.textarea}
          name="message"
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button type="submit" className={styles.submit}>
        SEND →
      </button>
      <p className={styles.formNote}>
        Opens your mail client — no backend wired up yet.
      </p>
    </form>
  );
}
