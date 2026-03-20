import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Specterfy — Privacy Pre-Processor'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050C15',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 800,
            height: 500,
            background: 'radial-gradient(ellipse, rgba(0,200,240,0.12) 0%, transparent 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Logo text */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#00C8F0',
            }}
          >
            PRIVACY PRE-PROCESSOR
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.04,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
            marginBottom: '28px',
          }}
        >
          Specterfy
        </div>

        <div
          style={{
            fontSize: '28px',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.4,
            maxWidth: '700px',
            marginBottom: '48px',
          }}
        >
          Sanitize sensitive PDFs before they become a workflow liability.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['5 sanitizes/day free', '$9.97/mo unlimited', 'Pennsylvania notaries'].map((pill) => (
            <div
              key={pill}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '100px',
                padding: '8px 18px',
                fontSize: '16px',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {pill}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            fontSize: '18px',
            color: '#00C8F0',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          specterfy.com
        </div>
      </div>
    ),
    { ...size }
  )
}
