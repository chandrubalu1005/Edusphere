import { Icon, ICONS } from '../Layout.jsx';

export default function ContentModalViewer({ open, content, onClose }) {
  if (!open || !content) return null;

  const isVideo = content.type === 'video' || (content.url && (content.url.endsWith('.mp4') || content.url.includes('youtube.com') || content.url.includes('vimeo.com')));
  const isPDF = content.type === 'document' || (content.url && content.url.endsWith('.pdf'));

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 800, padding: 0, overflow: 'hidden', borderRadius: 'var(--r-lg)' }}>
        <div style={{ padding: '16px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>{content.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', textTransform: 'capitalize' }}>{content.type || 'resource'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href={content.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d={ICONS.download} size={14} /> Open Original
            </a>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon d={ICONS.x} size={18} /></button>
          </div>
        </div>

        <div style={{ background: 'black', minHeight: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isVideo ? (
            content.url.includes('youtube.com') || content.url.includes('youtu.be') ? (
              <iframe
                width="100%"
                height="450"
                src={content.url.replace('watch?v=', 'embed/')}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls style={{ width: '100%', maxHeight: 450 }}>
                <source src={content.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          ) : isPDF ? (
            <iframe
              src={content.url}
              width="100%"
              height="450"
              style={{ border: 'none', background: 'white' }}
              title={content.title}
            />
          ) : (
            <div style={{ padding: 40, textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>External Web Link</div>
              <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20 }}>{content.url}</p>
              <a href={content.url} target="_blank" rel="noreferrer" className="btn btn-accent">
                Visit External Link →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
