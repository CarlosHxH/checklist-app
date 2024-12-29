// app/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
        <p className="mt-2">Você não tem permissão para acessar esta página.</p>
      </div>
    </div>
  );
}