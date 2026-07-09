const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-slate-950">
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: [
          'repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(168, 85, 247, 0.4) 59px, rgba(168, 85, 247, 0.4) 60px)',
          'repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(168, 85, 247, 0.4) 59px, rgba(168, 85, 247, 0.4) 60px)',
        ].join(', '),
      }} />

      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: [
          'repeating-linear-gradient(90deg, transparent, transparent 29px, rgba(168, 85, 247, 0.2) 29px, rgba(168, 85, 247, 0.2) 30px)',
          'repeating-linear-gradient(0deg, transparent, transparent 29px, rgba(168, 85, 247, 0.2) 29px, rgba(168, 85, 247, 0.2) 30px)',
        ].join(', '),
        backgroundPosition: '30px 30px',
      }} />

      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(1.5px 1.5px at 30px 30px, rgba(168, 85, 247, 0.6) 50%, transparent 50%)',
        backgroundSize: '60px 60px',
      }} />

      <div className="absolute top-[25%] left-0 w-[2px] h-[2px] bg-purple-500/25 animate-data-horizontal" />
      <div className="absolute top-[55%] left-0 w-[2px] h-[2px] bg-purple-500/20 animate-data-horizontal" style={{ animationDelay: '4s', animationDuration: '6s' }} />
      <div className="absolute top-0 left-[30%] w-[2px] h-[2px] bg-purple-500/25 animate-data-vertical" />
      <div className="absolute top-0 left-[70%] w-[2px] h-[2px] bg-purple-500/20 animate-data-vertical" style={{ animationDelay: '5s', animationDuration: '7s' }} />

      <div className="absolute top-6 left-6 w-10 h-10 border-t border-l border-purple-500/8" />
      <div className="absolute top-6 right-6 w-10 h-10 border-t border-r border-purple-500/8" />
      <div className="absolute bottom-6 left-6 w-10 h-10 border-b border-l border-purple-500/8" />
      <div className="absolute bottom-6 right-6 w-10 h-10 border-b border-r border-purple-500/8" />
    </div>
  )
}

export default DynamicBackground
