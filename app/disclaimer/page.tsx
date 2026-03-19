import type { Metadata } from 'next'
import LegalPage from '../../components/LegalPage'

export const metadata: Metadata = { title: 'Disclaimer — Specterfy' }

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer" subtitle="Legal" updated="March 19, 2026"
      notice="Specterfy is a privacy pre-processing utility. It is not a legal compliance tool, notary journal, or state-approved workflow system. Nothing in this product or its outputs constitutes legal advice. Users are solely responsible for final review and downstream handling of all documents."
      sections={[
        { title: 'Not a Legal Compliance Tool', content: 'Specterfy is designed to help sanitize sensitive PDF documents as a pre-ingestion workflow step. It is not a substitute for legal review, professional judgment, or compliance with applicable regulations.' },
        { title: 'Not a Notary Platform', content: ['Specterfy is not a notary journal.', 'Specterfy is not an e-notary platform.', 'Specterfy is not a Remote Online Notarization (RON) platform.', 'Specterfy does not issue seals, certifications, or approvals of any kind.', 'Specterfy does not perform ID verification.'] },
        { title: 'No Guarantee of Accuracy', content: 'Specterfy does not guarantee that sanitized outputs are complete, accurate, legally sufficient, or free from errors. Users must review all outputs before downstream use.' },
        { title: 'User Responsibility', content: 'You assume full responsibility for how you use Specterfy and for ensuring your use complies with all applicable laws, regulations, and professional obligations.' },
        { title: 'Pennsylvania Regulatory Context', content: 'References to Pennsylvania notary workflow considerations on this site reflect publicly available general information and are provided for context only. They do not constitute legal advice.' },
        { title: 'No Attorney-Client Relationship', content: 'Nothing in Specterfy, its outputs, or its communications constitutes legal advice or creates an attorney-client relationship.' },
        { title: 'Changes', content: 'This disclaimer may be updated from time to time. Continued use of Specterfy following any update constitutes your acceptance of the revised disclaimer.' },
      ]}
    />
  )
}
