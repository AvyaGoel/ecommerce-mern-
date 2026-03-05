import React from 'react';

const statusConfig = {
  Pending: { cls: 'badge-warning', icon: '⏳' },
  Processing: { cls: 'badge-info', icon: '⚙️' },
  Shipped: { cls: 'badge-default', icon: '🚚' },
  Delivered: { cls: 'badge-success', icon: '✅' },
  Cancelled: { cls: 'badge-error', icon: '✕' },
};

const OrderStatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { cls: 'badge-default', icon: '?' };
  return (
    <span className={`badge ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  );
};

export default OrderStatusBadge;