// components/RoleForm.tsx
import { Input } from '@/components/ui/input'
import { PermissionCard } from './PermissionCard'
import React from 'react'

interface Permission {
  code: string
  name: string
}

interface PermissionGroup {
  group: string
  permissions: Permission[]
}

const errorStyle = `mt-1 py-1 text-red-700 text-sm animate-pulse`

export function RoleForm(props: {
  name: string
  onName: (v: string) => void
  desc: string
  onDesc: (v: string) => void
  groups: PermissionGroup[]
  selected: string[]
  toggle: (code: string) => void
  toggleAll: (codes: string[], chk: boolean) => void
  errors: { name: string; desc: string; perms: string }
  nameRef?: React.Ref<HTMLDivElement>
  descRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <>
      <div ref={props.nameRef}>
        <label>Nombre</label>
        <Input value={props.name} className="border-2" onChange={e => props.onName(e.target.value)} />
        {props.errors.name && <p className={errorStyle}>{props.errors.name}</p>}
      </div>
      <div ref={props.descRef}>
        <label>Descripción</label>
        <Input value={props.desc} className="border-2" onChange={e => props.onDesc(e.target.value)} />
        {props.errors.desc && <p className={errorStyle}>{props.errors.desc}</p>}
      </div>
      <div>
        <span>Permisos</span>
        <div className="grid md:grid-cols-3 gap-4">
          {props.groups.map(group => (
            <PermissionCard
              key={group.group}
              group={group}
              selected={props.selected}
              onToggle={props.toggle}
              onToggleAll={props.toggleAll}
            />
          ))}
        </div>
        {props.errors.perms && <p className={errorStyle}>{props.errors.perms}</p>}
      </div>
    </>
  )
}
