export default function GlassCard({ as: As = 'div', className = '', children, ...props }) {
  return (
    <As className={`glass ${className}`.trim()} {...props}>
      {children}
    </As>
  )
}
