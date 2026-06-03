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
 * Sends the welcome email after a successful subscription checkout.
 * Called from the Stripe webhook on first insert of the subscription row, so
 * duplicate webhook deliveries don't produce duplicate emails.
 */
export async function sendPurchaseWelcomeEmail({ to }: { to: string }): Promise<void> {
  const reportsUrl = `${SITE_URL}/reports`;
  const accountUrl = `${SITE_URL}/account`;

  await getResend().emails.send({
    from: getFromAddress(),
    to,
    // Replies go to the support inbox (received via Resend, read in the
    // Resend dashboard) instead of the no-reply sender domain.
    replyTo: SUPPORT_EMAIL,
    subject: "Welcome to DeckForge — your subscription is active",
    html: buildWelcomeHtml({ reportsUrl, accountUrl, supportEmail: SUPPORT_EMAIL }),
    text: buildWelcomeText({ reportsUrl, accountUrl, supportEmail: SUPPORT_EMAIL }),
  });
}

function buildWelcomeHtml({
  reportsUrl,
  accountUrl,
  supportEmail,
}: {
  reportsUrl: string;
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
                  Your subscription is active. DeckForge turns your live company data into executive-ready reports — QBRs, investor updates, board decks, monthly close — and keeps them current. Manage or cancel anytime from your account.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
                  <tr>
                    <td style="background:#ffffff;border-radius:8px;">
                      <a href="${reportsUrl}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:500;color:#0b0b0f;text-decoration:none;">Open your reports →</a>
                    </td>
                  </tr>
                </table>

                <h2 style="margin:32px 0 12px;font-size:16px;color:#ffffff;font-weight:600;">Getting started</h2>
                <ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.7;color:#d1d5db;">
                  <li><strong style="color:#ffffff;">Connect your stack.</strong> Link Stripe, HubSpot, Notion, Slack, Linear and more — your reports build from live company data, not copy-paste.</li>
                  <li><strong style="color:#ffffff;">Generate in minutes.</strong> Pick a report — QBR, investor update, board deck, monthly close — and it assembles from your connected data.</li>
                  <li><strong style="color:#ffffff;">Refine and present.</strong> Every report is a cinematic, web-native presentation you can fully edit — rearrange, rewrite, and rebrand before the meeting.</li>
                  <li><strong style="color:#ffffff;">Always current.</strong> New report types and integrations ship regularly and appear in your account automatically — included in your subscription.</li>
                </ul>

                <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#d1d5db;">
                  Manage your subscription and invoices on your <a href="${accountUrl}" style="color:#ffffff;text-decoration:underline;">account page</a>. Questions, or a report type you wish existed? Write to <a href="mailto:${supportEmail}" style="color:#ffffff;text-decoration:underline;">${supportEmail}</a>.
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
  reportsUrl,
  accountUrl,
  supportEmail,
}: {
  reportsUrl: string;
  accountUrl: string;
  supportEmail: string;
}): string {
  return `You're in. Welcome aboard.

Your subscription is active. DeckForge turns your live company data into executive-ready reports — QBRs, investor updates, board decks, monthly close — and keeps them current. Manage or cancel anytime from your account.

Open your reports: ${reportsUrl}

Getting started:
- Connect your stack. Link Stripe, HubSpot, Notion, Slack, Linear and more — your reports build from live company data, not copy-paste.
- Generate in minutes. Pick a report — QBR, investor update, board deck, monthly close — and it assembles from your connected data.
- Refine and present. Every report is a cinematic, web-native presentation you can fully edit — rearrange, rewrite, and rebrand before the meeting.
- Always current. New report types and integrations ship regularly and appear in your account automatically — included in your subscription.

Manage your subscription and invoices on your account page: ${accountUrl}

Questions, or a report type you wish existed? Write to ${supportEmail}.

— DeckForge
`;
}
