import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default function AutoMarkIndicator({ canAutoMark }) {
  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        canAutoMark
          ? 'bg-orange-100 text-orange-800'
          : 'bg-yellow-100 text-yellow-800'
      }`}
      title={canAutoMark ? 'Can be automatically marked by system' : 'Requires manual marking'}
    >
      {canAutoMark ? (
        <>
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Auto-Mark</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Manual Mark</span>
        </>
      )}
    </div>
  );
}
