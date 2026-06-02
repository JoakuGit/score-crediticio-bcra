import type { ReactNode } from 'react';

interface ReviewItemProps {
  label: string;
  value: string;
  icon: ReactNode;
}

export function ReviewItem({ label, value, icon }: ReviewItemProps) {
  return (
    <article className="review-item">
      <span className="review-icon">{icon}</span>
      <div>
        <strong>{label}</strong>
        <small>{value}</small>
      </div>
    </article>
  );
}
