type PageHeaderProps = {
  title: string
  description: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="grid gap-1.5">
      <h1 className="text-[32px] leading-tight sm:text-[38px]">{title}</h1>
      <p className="text-[15px] text-ink-soft">{description}</p>
    </header>
  )
}
