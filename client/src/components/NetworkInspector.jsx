import { useEffect, useState } from 'react';
import { onRequestLog } from '../api.js';

export default function NetworkInspector() {
  const [log, setLog] = useState([]);
  useEffect(
    () => onRequestLog((e) => setLog((l) => [{ ...e, at: new Date().toLocaleTimeString() }, ...l].slice(0, 10))),
    []
  );
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Recent HTTP requests">
      <table>
        <caption>Last 10 requests made by this page</caption>
        <thead>
          <tr>
            <th scope="col">Time</th><th scope="col">Method</th><th scope="col">URL</th>
            <th scope="col">Status</th><th scope="col">ms</th><th scope="col">Content-Type</th>
          </tr>
        </thead>
        <tbody>
          {log.length === 0 ? (
            <tr><td colSpan={6}>No requests yet</td></tr>
          ) : (
            log.map((e, i) => (
              <tr key={i}>
                <td>{e.at}</td><td>{e.method}</td><td>{e.url}</td>
                <td>{e.status || 'failed'}</td><td>{e.ms}</td><td>{e.contentType}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
