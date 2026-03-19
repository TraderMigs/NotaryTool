import type { Metadata } from 'next'
import LegalPage from '../../components/LegalPage'

export const metadata: Metadata = { title: 'Terms of Service — Specterfy' }

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service" subtitle="Legal" updated="March 19, 2026"
      intro="These Terms of Service govern your access to and use of Specterfy. By creating an account or using the service, you agree to be bound by these terms."
      sections={[
        { title: 'What Specterfy Is', content: 'Specterfy is a privacy pre-processing utility designed to help sanitize sensitive PDF documents before they move into downstream handling workflows. Specterfy is not a notary journal, e-notary platform, RON platform, ID verification service, or legal compliance guarantee.' },
        { title: 'User Responsibility', content: ['You remain solely responsible for reviewing all outputs before downstream use.', 'You remain responsible for ensuring your workflows comply with applicable laws.', 'Specterfy does not guarantee that outputs meet any specific legal standard.', 'You are responsible for maintaining the security of your account credentials.'] },
        { title: 'Accounts', content: 'You must provide accurate account information at signup. You are responsible for activity under your account. Sharing accounts between users is not permitted.' },
        { title: 'Free Plan', content: 'The free plan provides 5 sanitize operations per day. Free plan access may be modified or discontinued at any time with reasonable notice.' },
        { title: 'Paid Plans', content: 'Paid plans are billed through Stripe. Access to paid features is contingent on confirmed payment. Specterfy reserves the right to modify pricing with reasonable advance notice.' },
        { title: 'Prohibited Use', content: ['Attempting to circumvent or abuse usage limits.', 'Using Specterfy to process documents in violation of applicable law.', 'Attempting to gain unauthorized access to other user accounts or systems.'] },
        { title: 'No Warranty', content: 'Specterfy is provided as-is without warranty of any kind. Specterfy does not warrant that outputs will meet any specific standard or legal requirement.' },
        { title: 'Limitation of Liability', content: 'To the maximum extent permitted by applicable law, Specterfy shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.' },
        { title: 'Changes to Terms', content: 'Specterfy may update these terms at any time. Continued use following notice of an update constitutes acceptance of the revised terms.' },
      ]}
    />
  )
}
