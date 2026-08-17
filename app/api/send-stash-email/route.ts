import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";

// Reads PDFs off the disk, so this can't run on the edge runtime.
export const runtime = "nodejs";

/**
 * The only four sends that can be requested.
 *
 * `emailId` is matched against these keys and the filename comes from the
 * table — a request never contributes to the path, so a crafted id can't walk
 * out of content/stash-email-pdfs.
 *
 * The PDFs live outside public/ on purpose: they're mailed, not browsable.
 */
const SENDS = {
  welcome: {
    file: "welcome.pdf",
    subject: "they're feeding corn to cars. eat yours first.",
  },
  "abandoned-cart": {
    file: "abandoned-cart.pdf",
    subject: "you were literally at checkout. where did you go, bro",
  },
  nachni: {
    file: "nachni.pdf",
    subject: "the og desi grain",
  },
  "bhutta-monday": {
    file: "bhutta-monday.pdf",
    subject: "mondays. am i right?",
  },
} as const;

type SendId = keyof typeof SENDS;

/** Deliberately loose — the real test of an address is whether it delivers. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resend's shared sender works with no domain setup, but only delivers to the
 * address that owns the API key. Set STASH_FROM_EMAIL once a domain is verified.
 */
const FROM = process.env.STASH_FROM_EMAIL ?? "Stash <onboarding@resend.dev>";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid request body" }, { status: 400 });
  }

  const { emailId, to } = (body ?? {}) as { emailId?: unknown; to?: unknown };

  // Object.hasOwn, not `SENDS[emailId]` — a plain lookup would happily return
  // an inherited member for ids like "constructor".
  if (typeof emailId !== "string" || !Object.hasOwn(SENDS, emailId)) {
    return Response.json({ error: "unknown email" }, { status: 400 });
  }

  if (typeof to !== "string" || to.length > 254 || !EMAIL_RE.test(to)) {
    return Response.json(
      { error: "that doesn't look like an email address" },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Checked before constructing Resend, which throws on a missing key.
    // This way an unconfigured deploy shows the form's error state instead
    // of a 500.
    return Response.json(
      { error: "sending isn't set up yet — no RESEND_API_KEY on the server" },
      { status: 503 },
    );
  }

  const send = SENDS[emailId as SendId];

  let attachment: Buffer;
  try {
    attachment = await readFile(
      path.join(process.cwd(), "content", "stash-email-pdfs", send.file),
    );
  } catch {
    return Response.json(
      { error: "that email's PDF is missing on the server" },
      { status: 500 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: send.subject,
      text: [
        "here's the email you asked for, attached as the original PDF.",
        "",
        "open it on your phone — that's what it was designed for.",
        "",
        "— stash",
      ].join("\n"),
      attachments: [{ filename: send.file, content: attachment }],
    });

    if (error) {
      return Response.json(
        { error: error.message || "couldn't send that, try again" },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "couldn't send that, try again" },
      { status: 502 },
    );
  }
}
