const BackgroundGradient = () => {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0" style={{ background: 'var(--gradient-homepage)' }} />
      <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(closest-side, hsl(210 100% 70% / 0.5), transparent)' }} />
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(closest-side, hsl(142 69% 58% / 0.5), transparent)' }} />
    </div>
  )
}

export default BackgroundGradient






