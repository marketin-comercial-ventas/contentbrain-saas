export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Plataforma Growth · Sales · Talent</h1>
      <p className="text-neutral-600">
        Foundation (F00). La especificación completa vive en{" "}
        <code className="rounded bg-neutral-100 px-1">docs/MASTER_PROMPT.md</code>.
      </p>
      <p className="text-sm text-neutral-500">
        Estado del sistema:{" "}
        <a className="underline" href="/api/health">
          /api/health
        </a>
      </p>
    </main>
  );
}
