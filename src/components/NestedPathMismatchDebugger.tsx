import { useLocation, useMatches, useParams, useResolvedPath } from 'react-router-dom';

export default function NestedPathMismatchDebugger() {
  const location = useLocation();
  const matches = useMatches();
  const params = useParams();
  const resolved = useResolvedPath('/q/artifact/:id'); // what the router *thinks* your route should resolve to

  console.log('🔥 NESTED PATH MISMATCH DEBUG');
  console.log('   Raw hash URL          :', window.location.hash);
  console.log('   Router pathname       :', location.pathname);
  console.log('   Expected match path   :', '/q/artifact/:id');
  console.log('   Resolved path         :', resolved.pathname);
  console.log('   Current params        :', params);
  console.log('   Full matched tree     :', matches.map(m => ({
    id: m.id,
    pathname: m.pathname,
    path: m.route.path,           // ← THIS IS THE KEY
    isExact: m.pathname === location.pathname
  })));

  // Visual mismatch flag
  const currentPath = location.pathname;
  const hasLeadingSlashChild = matches.some(m => m.route.path?.startsWith('/'));

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      background: '#111',
      color: '#0ff',
      padding: '16px',
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: '13px',
      zIndex: 99999,
      maxWidth: '460px',
      boxShadow: '0 0 0 4px #0ff',
      whiteSpace: 'pre-wrap'
    }}>
      <strong>🔥 PATH MISMATCH DETECTOR</strong><br />
      <span style={{color: '#ff0'}}>Hash: {window.location.hash}</span><br />
      <span style={{color: '#ff0'}}>Path: {currentPath}</span><br />
      <br />
      <strong>Matched routes &amp; paths:</strong><br />
      {matches.map((m, i) => (
        <div key={m.id} style={{marginLeft: i*12}}>
          {m.route.path?.startsWith('/') ? '🚫 ABSOLUTE ' : '✅ relative '}
          {m.route.path} → {m.pathname}
        </div>
      ))}
      {hasLeadingSlashChild && <div style={{color:'#f66', marginTop:8}}>🚨 CHILD ROUTE HAS LEADING / → ABSOLUTE MATCH ONLY</div>}
      <small style={{color:'#666', display:'block', marginTop:12}}>
        Target route "/q/artifact/:id" {matches.some(m => m.pathname.includes('artifact')) ? '✅ FOUND' : '❌ NOT IN TREE'}
      </small>
    </div>
  );
}