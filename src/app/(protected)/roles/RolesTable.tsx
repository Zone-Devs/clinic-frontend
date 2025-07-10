'use client'

import { useState, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'
import axiosClient from '@/utils/axiosClient'
import { FiSearch } from 'react-icons/fi'

// shadcn/ui
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
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
          // Si el backend devolvió un 404, axios entrará en el catch.
          setRoles(res.data.data)
          setTotalPages(res.data.totalPages)

        } catch (err: any) {
          // Si fue un 404: interpretamos “no hay resultados”
          if (err.response?.status === 404) {
            setRoles([])
            setTotalPages(0)
          } else {
            setError('Error interno en el servidor. Intente más tarde.')
          }
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

  const colorMap: Record<string, string> = {
    register: 'bg-green-100 text-green-800',
    list: 'bg-blue-100 text-blue-800',
    edit: 'bg-yellow-100 text-yellow-800',
    delete: 'bg-red-100 text-red-800',
    show: 'bg-purple-100 text-purple-800',
    default: 'bg-orange-100 text-gray-800',
  }
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
        <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground">Nombre</TableHead>
              <TableHead className="text-primary-foreground">Descripción</TableHead>
              <TableHead className="text-primary-foreground text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* … loading, error, rows … */}
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
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description ?? '—'}</TableCell>
                <TableCell className="text-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" size="sm">Ver permisos</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Permisos de {role.name}</DialogTitle>
                      </DialogHeader>

                      <ScrollArea className="mt-4 h-[60vh] space-y-6">
                        <Table>
                          <TableHeader className="bg-muted">
                            <TableRow>
                              <TableHead>Grupo</TableHead>
                              <TableHead>Permisos</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {role.permissionsGroups.map(group => (
                              <TableRow key={group.group}>
                                <TableCell className="font-medium">{group.group}</TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    {group.permissions.map(perm => {
                                      const codePreffix = perm.code.split('_')[0];
                                      const classes = colorMap[codePreffix] ?? colorMap.default;
                                      return (
                                        <Badge key={perm.code} className={`${classes} text-xs`}>
                                          {perm.name}
                                        </Badge>
                                      )
                                    })}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
        </div>

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
