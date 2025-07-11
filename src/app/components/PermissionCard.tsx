// PermissionCard.tsx
'use client'
import { memo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

interface Permission {
  code: string
  name: string
}
interface PermissionGroup {
  group: string
  permissions: Permission[]
}
interface Props {
  group: PermissionGroup
  selected: string[]
  onToggle: (code: string) => void
  onToggleAll: (codes: string[], checked: boolean) => void
}

export const PermissionCard = memo(function PermissionCard({
  group, selected, onToggle, onToggleAll
}: Props) {
  const codes = group.permissions.map(p => p.code)
  const allSel = codes.every(c => selected.includes(c))

  return (
    <Card className="flex-1 shadow rounded-lg p-0 gap-0 overflow-hidden">
      <CardHeader className="flex items-center justify-between text-primary-foreground bg-primary px-4 py-2">
        <CardTitle className="text-lg">{group.group}</CardTitle>
        <Checkbox
          checked={allSel}
          onCheckedChange={ch => onToggleAll(codes, !!ch)}
        />
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        {group.permissions.map(perm => (
          <label key={perm.code} className="flex items-center space-x-2">
            <Checkbox
              checked={selected.includes(perm.code)}
              onCheckedChange={() => onToggle(perm.code)}
            />
            <span className="text-sm">{perm.name}</span>
          </label>
        ))}
      </CardContent>
    </Card>
  )
})
