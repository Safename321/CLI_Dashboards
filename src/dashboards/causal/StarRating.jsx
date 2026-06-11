// 5-star confidence rating used across the Behavioral-Outcome views.
export default function StarRating({ n }) {
  return (
    <span className="text-xs tracking-tighter text-amber-400" aria-label={`${n} of 5 stars`}>
      {'★'.repeat(n)}
      <span className="text-slate-600">{'★'.repeat(5 - n)}</span>
    </span>
  );
}
