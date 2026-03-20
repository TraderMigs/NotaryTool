import type { Metadata } from 'next'
import LegalPage from '../../components/LegalPage'

export const metadata: Metadata = { title: 'Privacy Policy — Specterfy' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy" subtitle="Legal" updated="March 20, 2026"
      notice="Specterfy does not access, store, or transmit the content of documents you process. All sanitization operations occur locally in your browser session."
      intro="This Privacy Policy explains how Specterfy collects and handles information when you use the service."
      sections={[
        { title: 'Information We Collect', content: ['Account information: email address and encrypted password provided at signup.', 'Usage data: sanitize counts, session activity, page counts, and plan status.', 'Billing information: payment state managed by Stripe. Specterfy does not store card details.', 'Email communications: your email address is used to send transactional messages including account confirmation, payment receipts, product updates, and renewal reminders. You may receive a short onboarding email sequence following signup.', 'We do not collect, access, or store the content of any document you upload or process.'] },
        { title: 'How We Use Information', content: ['To operate your account and enforce plan limits.', 'To process and verify payment status.', 'To send transactional and service-related emails to your registered address.', 'To maintain service integrity and prevent abuse.', 'We do not sell your information to third parties.'] },
        { title: 'Administrative Access', content: 'Specterfy\'s owner and administrator has access to account-level data including registered email addresses, plan status, and aggregate usage statistics (sanitize counts and page counts) for all users. This access is used solely for service operations, support, and analytics. No document content is ever accessible to administrators.' },
        { title: 'Document Data', content: 'All PDF processing occurs within your browser session. Document content is not transmitted to Specterfy servers and is never retained.' },
        { title: 'Third-Party Services', content: ['Supabase: authentication and account data storage.', 'Stripe: payment processing and subscription management.', 'Vercel: hosting and content delivery.', 'Resend: transactional email delivery.'] },
        { title: 'Data Retention', content: 'Account data is retained while your account is active. Usage statistics are retained for service analytics. You may request deletion by contacting support, after which your account and associated records will be permanently removed. Document processing data is never retained beyond your active browser session.' },
        { title: 'Your Rights', content: ['Access the account data we hold about you.', 'Request correction of inaccurate account data.', 'Request deletion of your account and all associated records.', 'Opt out of non-transactional email communications by contacting support.'] },
        { title: 'Contact', content: 'For privacy-related inquiries, contact us via the Specterfy website.' },
      ]}
    />
  )
}
