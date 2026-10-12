export default function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex w-full items-center gap-3 text-sm text-neutral-500" role="separator">
      <span className="h-px flex-1 bg-neutral-200" />
      {label}
      <span className="h-px flex-1 bg-neutral-200" />
    </div>
  );
}