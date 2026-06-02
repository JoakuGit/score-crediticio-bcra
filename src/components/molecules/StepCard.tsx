interface StepCardProps {
  index: number;
  title: string;
  description: string;
  active: boolean;
  done: boolean;
}

export function StepCard({ index, title, description, active, done }: StepCardProps) {
  return (
    <article className={`step-card ${active ? 'active' : ''} ${done ? 'done' : ''}`.trim()}>
      <span>{index + 1}</span>
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
    </article>
  );
}
