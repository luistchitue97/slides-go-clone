import { Resend } from "resend";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

/**
 * Lazy Resend client. Constructed on first call so this module is safe to
 * import during Next.js build (where env vars aren't available for route-data
 * collection). Mirrors the pattern in @/lib/stripe.
 */
let _resend: Resend | null = null;

function getResend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to .env.local for local dev or to Vercel for production.",
    );
  }
  _resend = new Resend(key);
  return _resend;
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL is not set. Use a verified domain from your Resend dashboard, " +
        'e.g. "DeckForge <hello@mail.luistchitue.com>".',
    );
  }
  return from;
}

/**
 * Sends the all-access welcome email after a successful checkout.
 * Called from the Stripe webhook on first insert of a purchase row, so
 * duplicate webhook deliveries don't produce duplicate emails.
 */
export async function sendPurchaseWelcomeEmail({ to }: { to: string }): Promise<void> {
  const galleryUrl = `${SITE_URL}/reports`;
  const accountUrl = `${SITE_URL}/account`;

  await getResend().emails.send({
    from: getFromAddress(),
    to,
    // Replies go to the support inbox (received via Resend, read in the
    // Resend dashboard) instead of the no-reply sender domain.
    replyTo: SUPPORT_EMAIL,
    subject: "Welcome to DeckForge — your all-access is active",
    html: buildWelcomeHtml({ galleryUrl, accountUrl, supportEmail: SUPPORT_EMAIL }),
    text: buildWelcomeText({ galleryUrl, accountUrl, supportEmail: SUPPORT_EMAIL }),
  });
}

function buildWelcomeHtml({
  galleryUrl,
  accountUrl,
  supportEmail,
}: {
  galleryUrl: string;
  accountUrl: string;
  supportEmail: string;
}): string {
  // Inline styles only — most email clients strip <style> blocks. Keep the
  // design simple; the brand can carry it without ornate layout.
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e5e7eb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0b0f;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#15151c;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#a78bfa;">DeckForge</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:#ffffff;font-weight:600;">You're in. Welcome aboard.</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d1d5db;">
                  Your all-access pass is active — every template in the library is yours, current and future. No subscription, no renewal, no extra steps.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                  <tr>
                    <td style="background:#ffffff;border-radius:8px;">
                      <a href="${galleryUrl}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:500;color:#0b0b0f;text-decoration:none;">Open the gallery →</a>
                    </td>
                  </tr>
                </table>

                <h2 style="margin:32px 0 12px;font-size:16px;color:#ffffff;font-weight:600;">Getting the most out of DeckForge</h2>
                <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:#d1d5db;">
                  <li><strong style="color:#ffffff;">Open in one click.</strong> Each template is its own app — no import, no install, no migration.</li>
                  <li><strong style="color:#ffffff;">Pick by job, not by aesthetic.</strong> Each template solves a specific problem (pitch, QBR, postmortem, monthly close). Start with the one that matches the meeting you're walking into.</li>
                  <li><strong style="color:#ffffff;">Edit live.</strong> You're not downloading a static deck — the template runs, so changes you make stick.</li>
                  <li><strong style="color:#ffffff;">New decks land regularly.</strong> They appear in your gallery automatically the day they ship. No action needed on your side.</li>
                </ul>

                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#d1d5db;">
                  Manage your purchase or invoices on your <a href="${accountUrl}" style="color:#ffffff;text-decoration:underline;">account page</a>. Questions, requests, or a template you wish existed? Write to <a href="mailto:${supportEmail}" style="color:#ffffff;text-decoration:underline;">${supportEmail}</a>.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:11px;color:#6b7280;">© ${new Date().getFullYear()} DeckForge</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildWelcomeText({
  galleryUrl,
  accountUrl,
  supportEmail,
}: {
  galleryUrl: string;
  accountUrl: string;
  supportEmail: string;
}): string {
  return `You're in. Welcome aboard.

Your all-access pass is active — every template in the library is yours, current and future. No subscription, no renewal, no extra steps.

Open the gallery: ${galleryUrl}

Getting the most out of DeckForge:
- Open in one click. Each template is its own app — no import, no install, no migration.
- Pick by job, not by aesthetic. Each template solves a specific problem (pitch, QBR, postmortem, monthly close). Start with the one that matches the meeting you're walking into.
- Edit live. You're not downloading a static deck — the template runs, so changes you make stick.
- New decks land regularly. They appear in your gallery automatically the day they ship.

Manage your purchase or invoices on your account page: ${accountUrl}

Questions, requests, or a template you wish existed? Write to ${supportEmail}.

— DeckForge
`;
}
