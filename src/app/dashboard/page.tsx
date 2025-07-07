import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    // Redirect to the login if there is no logged user
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/login';`,
        }}
      />
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl">Bienvenido</h1>
      <p>Esta es tu área protegida.</p>
    </main>
  );
}
