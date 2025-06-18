export default function HomePage(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-900">
      <>{props.children}</>
    </div>
  );
}
