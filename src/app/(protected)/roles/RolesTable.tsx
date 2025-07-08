'use client'

import { useState, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'
import axiosClient from '@/utils/axiosClient'
import { FiSearch } from 'react-icons/fi'

// shadcn/ui
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Permission {
  code: string
  name: string
}

interface PermissionGroup {
  group: string
  permissions: Permission[]
}

interface Role {
  id: string
  name: string
  description?: string
  permissionsGroups: PermissionGroup[]
}

interface ApiResponse {
  data: Role[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  // Modal
  const [currentRole, setCurrentRole] = useState<Role | null>(null)

  // Debounce fetch
  const debouncedFetch = useMemo(
    () =>
      debounce(async (q: string, p: number) => {
        setLoading(true)
        setError(undefined)
        try {
          const res = await axiosClient.get<ApiResponse>(
            `/api/roles?search=${encodeURIComponent(q)}&page=${p}`
          )
          setRoles(res.data.data)
          setTotalPages(res.data.totalPages)
        } catch (err) {
          console.error(err)
          setError('No se pudieron cargar los roles.')
        } finally {
          setLoading(false)
        }
      }, 500),
    []
  )

  useEffect(() => {
    debouncedFetch(search, page)
    return () => {
      debouncedFetch.cancel()
    }
  }, [search, page, debouncedFetch])

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div className="flex items-center space-x-2">
        <FiSearch className="text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre…"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-sm"
        />
      </div>

      {/* Tabla */}
      <ScrollArea className="border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Cargando…
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No se encontraron roles.
                </TableCell>
              </TableRow>
            ) : (
              roles.map(role => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description ?? '—'}</TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm">
                          Ver permisos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            Permisos de {role.name}
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="mt-4 max-h-64 space-y-4">
                          {role.permissionsGroups.map(group => (
                            <div key={group.group}>
                              <h3 className="font-medium">{group.group}</h3>
                              <ul className="ml-4 list-disc space-y-1">
                                {group.permissions.map(perm => (
                                  <li key={perm.code}>{perm.name}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* Paginación */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page <= 1}
          variant="outline"
        >
          Anterior
        </Button>
        <span>
          Página {page} de {totalPages}
        </span>
        <Button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
          variant="outline"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
