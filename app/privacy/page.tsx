import type { Metadata } from 'next'
import LegalPage from '../../components/LegalPage'

export const metadata: Metadata = { title: 'Privacy Policy — Specterfy' }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy" subtitle="Legal" updated="March 19, 2026"
      notice="Specterfy does not access, store, or transmit the content of documents you process. All sanitization operations occur locally in your browser session."
      intro="This Privacy Policy explains how Specterfy collects and handles information when you use the service."
      sections={[
        { title: 'Information We Collect', content: ['Account information: email address and encrypted password.', 'Usage data: sanitize counts, session activity, and plan status.', 'Billing information: payment state managed by Stripe. Specterfy does not store card details.', 'We do not collect, access, or store the content of any document you upload or process.'] },
        { title: 'How We Use Information', content: ['To operate your account and enforce plan limits.', 'To process and verify payment status.', 'To maintain service integrity and prevent abuse.', 'We do not sell your information to third parties.'] },
        { title: 'Document Data', content: 'All PDF processing occurs within your browser session. Document content is not transmitted to Specterfy servers and is never retained.' },
        { title: 'Third-Party Services', content: ['Supabase: authentication and account data storage.', 'Stripe: payment processing and subscription management.', 'Vercel: hosting and content delivery.'] },
        { title: 'Data Retention', content: 'Account data is retained while your account is active. You may request deletion by contacting support. Document processing data is never retained beyond your active browser session.' },
        { title: 'Your Rights', content: ['Access the account data we hold about you.', 'Request correction of inaccurate account data.', 'Request deletion of your account and associated records.'] },
        { title: 'Contact', content: 'For privacy-related inquiries, contact us via the Specterfy website.' },
      ]}
    />
  )
}
