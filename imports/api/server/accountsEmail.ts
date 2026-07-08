// Server-only: customizes the email templates used by accounts-passwordless
// when sending the 6-digit login code. Replace brand voice/copy per project.
import dedent from 'dedent';
import { Accounts } from 'meteor/accounts-base';
import { CONTACT_EMAIL } from '../constants';

Accounts.emailTemplates.from = `App <${CONTACT_EMAIL}>`;

Accounts.emailTemplates.sendLoginToken = {
  subject() {
    return 'Your App access code';
  },
  text(_user, _url, { sequence }) {
    return dedent`Hi! 👋

      Your App access code is: ${sequence}

      If you didn't request this code, you can ignore this email.

      Thanks,
      App
    `;
  },
  html(_user, url, { sequence }) {
    return dedent`
      <div style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;text-align:center;color:#0E0F12;">
        <h1 style="font-size:22px;font-weight:600;margin:0 0 8px;">Hi! 👋</h1>
        <p style="font-size:15px;color:#4B5563;margin:0 0 24px;line-height:1.5;">Your App access code is:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#F59E0B;margin:0 0 24px;">${sequence}</p>
        <p style="font-size:13px;color:#6B7280;margin:0;line-height:1.5;">If you didn't request this code, you can ignore this email.</p>
        <hr style="border:0;border-top:1px solid #E5E7EB;margin:32px 0;" />
        <p style="font-size:12px;color:#9CA3AF;margin:0;">
          You received this email because someone requested an access code. Or <a href="${url}" style="color:#F59E0B;">tap here to sign in directly</a>.
        </p>
      </div>
    `;
  },
};
