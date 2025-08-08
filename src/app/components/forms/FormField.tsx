import { FieldError } from "./FieldError"

export function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block">
        <span className="text-sm font-medium">{label}</span>
        {children}
      </label>
      <FieldError message={error} />
    </div>
  )
}
