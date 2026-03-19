import type { Metadata } from 'next'
import LegalPage from '../../components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy — Specterfy',
  description: 'How Specterfy handles your data and protects your privacy.',
}

export default function PrivacyPage() {
  return (
    <LegalPage
      type="privacy"
      title="Privacy Policy"
      subtitle="Legal"
      updated="March 19, 2026"
      notice="Specterfy does not access, store, or transmit the content of documents you process. All sanitization operations occur locally in your browser session. Specterfy does not retain document data after a session ends."
      intro="This Privacy Policy explains how Specterfy collects and handles information when you use the service. By using Specterfy, you agree to the practices described here."
      sections={[
        {
          title: 'Information We Collect',
          content: [
            'Account information: email address and encrypted password for authentication.',
            'Usage data: sanitize counts, session activity, and plan status.',
            'Billing information: payment state managed by Stripe. Specterfy does not store card details.',
            'We do not collect, access, or store the content of any document you upload or process.',
          ],
        },
        {
          title: 'How We Use Information',
          content: [
            'To operate your account and enforce plan limits.',
            'To process and verify payment status.',
            'To maintain service integrity and prevent abuse.',
            'We do not sell your information to third parties.',
          ],
        },
        {
          title: 'Document Data',
          content: 'All PDF processing occurs within your browser session. Document content is not transmitted to Specterfy servers. Specterfy does not retain, review, or have access to any document content you process.',
        },
        {
          title: 'Cookies and Storage',
          content: 'Specterfy uses session cookies for authentication and local browser storage for temporary session state during document processing. No third-party advertising or tracking cookies are used.',
        },
        {
          title: 'Third-Party Services',
          content: [
            'Supabase: authentication and account data storage.',
            'Stripe: payment processing and subscription management.',
            'Vercel: hosting and content delivery.',
            'Each third party operates under its own privacy policy.',
          ],
        },
        {
          title: 'Data Retention',
          content: 'Account data is retained while your account is active. You may request deletion of your account and associated data by contacting support. Document processing data is never retained beyond your active browser session.',
        },
        {
          title: 'Your Rights',
          content: [
            'Access the account data we hold about you.',
            'Request correction of inaccurate account data.',
            'Request deletion of your account and associated records.',
            'Withdraw consent by closing your account.',
          ],
        },
        {
          title: 'Contact',
          content: 'For privacy-related inquiries, contact us at the address provided on the Specterfy website. We will respond within a reasonable timeframe.',
        },
      ]}
    />
  )
}
