import Link from 'next/link'
export default function TopBar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-brand-mint" />
        <div className="text-xl font-semibold">{title}</div>
      </div>
      <nav className="flex items-center gap-3">
        <Link className="badge" href="/dashboard">Dashboard</Link>
        <Link className="badge" href="/profile">Profile</Link>
      </nav>
    </header>
  )
}
