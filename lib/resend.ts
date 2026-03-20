import { Resend } from 'resend'

// Server-side only — never import in client components
// Lazy: instantiated inside each function so build-time missing env var does not throw
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set.')
  return new Resend(key)
}

export async function sendWelcomeEmail(email: string) {
  const resend = getResend()
  await resend.emails.send({
    from: 'Specterfy <no-reply@specterfy.com>',
    to: email,
    subject: 'Welcome to Specterfy',
    html: `
      <div style="font-family: sans-serif; background: #050C15; color: #fff; padding: 40px; max-width: 560px; margin: 0 auto; border-radius: 12px;">
        <img src="https://specterfy.com/specterfy-logo.png" alt="Specterfy" style="height: 40px; margin-bottom: 32px;" />
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">You're in.</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
          Your Specterfy account is active. You have 5 free sanitizes per day to start.
          Head to your dashboard to begin processing documents.
        </p>
        <a href="https://specterfy.com/sanitize"
           style="display: inline-block; background: #00C8F0; color: #020C14; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Open sanitize tool
        </a>
        <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 32px; line-height: 1.6;">
          Specterfy is a privacy pre-processing utility. It is not a legal compliance platform.
          You remain responsible for all output review and downstream handling.
        </p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const resend = getResend()
  await resend.emails.send({
    from: 'Specterfy <no-reply@specterfy.com>',
    to: email,
    subject: 'Reset your Specterfy password',
    html: `
      <div style="font-family: sans-serif; background: #050C15; color: #fff; padding: 40px; max-width: 560px; margin: 0 auto; border-radius: 12px;">
        <img src="https://specterfy.com/specterfy-logo.png" alt="Specterfy" style="height: 40px; margin-bottom: 32px;" />
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Reset your password</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
          Click the button below to set a new password. This link expires in 60 minutes.
        </p>
        <a href="${resetLink}"
           style="display: inline-block; background: #00C8F0; color: #020C14; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Reset password
        </a>
        <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 32px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}

export async function sendPaymentConfirmEmail(email: string, plan: string) {
  const resend = getResend()
  const planLabel = plan === 'yearly' ? 'Yearly ($89/yr)' : 'Monthly ($9.97/mo)'
  await resend.emails.send({
    from: 'Specterfy <no-reply@specterfy.com>',
    to: email,
    subject: 'Your Specterfy subscription is active',
    html: `
      <div style="font-family: sans-serif; background: #050C15; color: #fff; padding: 40px; max-width: 560px; margin: 0 auto; border-radius: 12px;">
        <img src="https://specterfy.com/specterfy-logo.png" alt="Specterfy" style="height: 40px; margin-bottom: 32px;" />
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Subscription confirmed.</h1>
        <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 8px;">
          Plan: <strong style="color: #00C8F0;">${planLabel}</strong>
        </p>
        <p style="color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
          Unlimited sanitization is now active on your account.
        </p>
        <a href="https://specterfy.com/sanitize"
           style="display: inline-block; background: #00C8F0; color: #020C14; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Open sanitize tool
        </a>
      </div>
    `,
  })
}
