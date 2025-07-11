'use client'

import { useState, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'
import axiosClient from '@/utils/axiosClient'
import { FiSearch } from 'react-icons/fi'

// shadcn/ui
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Skeleton } from '@/components/ui/skeleton'

// Cards & Modals
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { CreateRoleDialog } from '@/app/components/CreateRoleDialog'
import { EditRoleDialog } from '@/app/components/EditRoleDialog'
import { DeleteRoleDialog } from '@/app/components/DeleteRoleDialog'

interface Permission { code: string; name: string }
interface PermissionGroup { group: string; permissions: Permission[] }
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

  // debounced fetch
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
        } catch {
          setError('No se pudieron cargar los roles.')
        } finally {
          setLoading(false)
        }
      }, 800),
    []
  )

  const refresh = () => debouncedFetch('', 1)

  useEffect(() => {
    debouncedFetch(search, page)
    return () => {
      debouncedFetch.cancel()
    }
  }, [search, page, debouncedFetch])

  const colorMap: Record<string, string> = {
    register: 'bg-green-100 text-green-800',
    list: 'bg-blue-100  text-blue-800',
    edit: 'bg-yellow-100 text-yellow-800',
    delete: 'bg-red-100   text-red-800',
    show: 'bg-purple-100 text-purple-800',
    default: 'bg-gray-100  text-gray-800',
  }

  return (
    <div className="space-y-6">
      {/* Buscador + Nuevo rol */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2 w-full sm:w-md">
          <FiSearch className="text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full"
          />
        </div>
        <CreateRoleDialog onCreated={refresh} />
      </div>

      {/* ─── CARDS EN MÓVIL ─── */}
      <div className="flex flex-col space-y-4 md:hidden">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="shadow-sm animate-pulse">
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-2/3 rounded" />
                </CardContent>
              </Card>
            ))
          : error
          ? (
              <p className="text-center text-destructive">{error}</p>
            )
          : roles.length === 0
          ? (
              <p className="text-center">No se encontraron roles.</p>
            )
          : roles.map((role) => (
              <Card key={role.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          {role.name}
                        </span>
                      </DialogTrigger>
                      <DialogContent className="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-lg lg:max-w-xl max-h-[70vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Permisos de {role.name}</DialogTitle>
                          <DialogClose className="absolute right-4 top-4" />
                        </DialogHeader>
                        <ScrollArea className="mt-2">
                          <Table>
                            <TableHeader className="bg-muted">
                              <TableRow>
                                <TableHead>Grupo</TableHead>
                                <TableHead>Permisos</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {role.permissionsGroups.map((group) => (
                                <TableRow key={group.group}>
                                  <TableCell className="font-medium">
                                    {group.group}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-2">
                                      {group.permissions.map((perm) => {
                                        const prefix = perm.code.split('_')[0]
                                        const cls =
                                          colorMap[prefix] ??
                                          colorMap.default
                                        return (
                                          <Badge
                                            key={perm.code}
                                            className={`${cls} text-xs`}
                                          >
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
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    <strong>Descripción:</strong>{' '}
                    {role.description || '—'}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ─── TABLA EN DESKTOP ─── */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader className="bg-primary">
            <TableRow>
              <TableHead className="text-primary-foreground">
                Nombre
              </TableHead>
              <TableHead className="text-primary-foreground">
                Descripción
              </TableHead>
              <TableHead className="text-primary-foreground text-center">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-24 animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48 animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="h-4 w-16 animate-pulse rounded mx-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : error
              ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-destructive"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                )
              : roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <span className="text-blue-600 hover:underline cursor-pointer">
                            {role.name}
                          </span>
                        </DialogTrigger>
                        <DialogContent className="w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-lg lg:max-w-xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Permisos de {role.name}
                            </DialogTitle>
                            <DialogDescription>
                            Aqui podras ver los permisos asignados al usuario.
                            </DialogDescription>
                            <DialogClose className="absolute right-4 top-4" />
                          </DialogHeader>
                          <ScrollArea className="mt-4">
                            <Table>
                              <TableHeader className="bg-muted">
                                <TableRow>
                                  <TableHead>Grupo</TableHead>
                                  <TableHead>Permisos</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {role.permissionsGroups.map((group) => (
                                  <TableRow key={group.group}>
                                    <TableCell className="font-medium">
                                      {group.group}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-2">
                                        {group.permissions.map((perm) => {
                                          const prefix =
                                            perm.code.split('_')[0]
                                          const cls =
                                            colorMap[prefix] ??
                                            colorMap.default
                                          return (
                                            <Badge
                                              key={perm.code}
                                              className={`${cls} text-xs`}
                                            >
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
                    <TableCell>
                      {role.description || '—'}
                    </TableCell>
                    <TableCell className="text-center space-x-2">
                      <EditRoleDialog role={role} onEdited={refresh} />
                      <DeleteRoleDialog
                        roleId={role.id}
                        onDeleted={refresh}
                      />
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
          variant="outline"
        >
          Anterior
        </Button>
        <span>
          Página {page} de {totalPages}
        </span>
        <Button
          onClick={() =>
            setPage((p) => Math.min(p + 1, totalPages))
          }
          disabled={page >= totalPages}
          variant="outline"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}
