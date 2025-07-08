'use client'
import { useState, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'
import axiosClient from '@/utils/axiosClient'
import { FiSearch, FiX } from 'react-icons/fi'

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
  const [modalOpen, setModalOpen] = useState(false)
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
    return () => { debouncedFetch.cancel() }
  }, [search, page, debouncedFetch])

  function openModal(role: Role) {
    setCurrentRole(role)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setCurrentRole(null)
  }

  return (
    <div>
      {/* Buscador */}
      <div className="mb-4 flex items-center space-x-2">
        <FiSearch />
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="border p-2 rounded flex-1"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-auto border rounded">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center">Cargando…</td></tr>
            ) : error ? (
              <tr><td colSpan={4} className="p-4 text-center text-red-500">{error}</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center">No se encontraron roles.</td></tr>
            ) : (
              roles.map(role => (
                <tr key={role.id} className="border-t">
                  <td className="p-2">{role.id}</td>
                  <td className="p-2">{role.name}</td>
                  <td className="p-2">{role.description ?? '—'}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => openModal(role)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver permisos
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="mt-4 flex items-center justify-center space-x-2">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page} de {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>

      {/* Modal de permisos */}
      {modalOpen && currentRole && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="rounded bg-white bg-opacity-90 shadow-lg max-w-xl w-full p-6 relative">
            {/* Cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 "
            >
              <FiX size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">
              Permisos de <span className="capitalize">{currentRole.name}</span>
            </h2>

            <div className="space-y-4 max-h-96 overflow-auto">
              {currentRole.permissionsGroups.map(group => (
                <div key={group.group}>
                  <h3 className="font-medium">{group.group}</h3>
                  <ul className="ml-4 list-disc">
                    {group.permissions.map(perm => (
                      <li key={perm.code}>{perm.name}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
