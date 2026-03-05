import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '32px', flexWrap: 'wrap' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>← Prev</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} className={`btn btn-sm ${p === currentPage ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button className="btn btn-secondary btn-sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next →</button>
    </div>
  );
};

export default Pagination;