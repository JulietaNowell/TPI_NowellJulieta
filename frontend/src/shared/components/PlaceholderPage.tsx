import { Link } from 'react-router-dom'

interface PlaceholderPageProps {
  title: string
  description: string
}

export function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-4 text-slate-600">
        {description}
      </p>

      <Link
        to="/"
        className="mt-6 inline-block text-emerald-700 underline"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
