import { useState, useEffect, useCallback } from 'react'
import axiosClient from '@/utils/axiosClient'

interface PermissionGroup {
  group: string
  permissions: { code: string; name: string }[]
}

export function useRoleForm(initial: {
  name: string
  description: string
  permissionsGroups?: PermissionGroup[]
}) {
  const [name, setName] = useState(initial.name)
  const [desc, setDesc] = useState(initial.description)
  const [groups, setGroups] = useState<PermissionGroup[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loadingPerms, setLoadingPerms] = useState(false)
  const [errorPerms, setErrorPerms] = useState<string>()
  const [errors, setErrors] = useState({
    name: '',
    desc: '',
    perms: '',
  })

  // ─── carga permisos y preselecciona según initial.permissionsGroups ───
  useEffect(() => {
    setLoadingPerms(true)
    axiosClient
      .get<PermissionGroup[]>('/api/permissions')
      .then((res) => {
        setGroups(res.data)
        if (initial.permissionsGroups) {
          const codes = initial.permissionsGroups.flatMap((g) =>
            g.permissions.map((p) => p.code)
          )
          setSelected(codes)
        }
      })
      .catch(() => setErrorPerms('No se pudieron cargar los permisos.'))
      .finally(() => setLoadingPerms(false))
  }, [])

  // ─── alterna un permiso individual ───
  const togglePermission = useCallback((code: string) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }, [])

  // ─── alterna todos los permisos de un grupo ───
  const toggleAll = useCallback(
    (codes: string[], checked: boolean) => {
      setSelected((prev) =>
        checked
          ? Array.from(new Set([...prev, ...codes]))
          : prev.filter((c) => !codes.includes(c))
      )
    },
    []
  )

  // ─── valida campos y llena `errors` ───
const validate = useCallback(() => {
  const errs = { name: '', desc: '', perms: '' }
  if (!name.trim())         errs.name  = 'El nombre es obligatorio.'
  else if (name.trim().length < 3) errs.name  = 'El nombre debe contener mínimo 3 caracteres.'

  if (!desc.trim())         errs.desc  = 'La descripción es obligatoria.'
  else if (desc.trim().length < 3) errs.desc  = 'La descripción debe contener mínimo 3 caracteres.'

  if (selected.length === 0) errs.perms = 'Debes seleccionar al menos un permiso.'

  setErrors(errs)
  return errs
}, [name, desc, selected])

  // ─── resetea todo al estado inicial ───
  const reset = useCallback(() => {
    setName(initial.name)
    setDesc(initial.description)
    if (initial.permissionsGroups) {
      const codes = initial.permissionsGroups.flatMap((g) =>
        g.permissions.map((p) => p.code)
      )
      setSelected(codes)
    } else {
      setSelected([])
    }
    setErrors({ name: '', desc: '', perms: '' })
  }, [initial])

  return {
    name,
    onName: setName,
    desc,
    onDesc: setDesc,
    groups,
    selected,
    loadingPerms,
    errorPerms,
    errors,
    toggle: togglePermission,
    toggleAll,
    validate,
    reset,
  }
}
