'use client'

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import NoDataFallback from '@/app/components/NoDataFallback'

export interface Category {
  id: string
  name: string
  description: string
  createdAt?: any
  createdLocalTime?: any
  updatedAt?: any
  updatedLocalTime?: any
}

interface CategoryTableProps {
  data: Category[]
  onEdit: (category: Category) => void
  onDelete: (id: string, name: string) => void
}

export function CategoryTable({ data, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="overflow-x-auto w-full max-w-full">
      {data?.length > 0 ? <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%] bg-primary text-primary-foreground border-r border-primary-foreground">Nombre</TableHead>
            <TableHead className="w-[60%] bg-primary text-primary-foreground border-r border-primary-foreground">Descripción</TableHead>
            <TableHead className="w-[10%] bg-primary text-primary-foreground text-left">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((cat) => (
            <TableRow key={cat.id} className="min-w-0">
              <TableCell className="w-[30%] truncate whitespace-nowrap overflow-hidden max-w-[70px]">
                {cat.name}
              </TableCell>
              <TableCell className="w-[60%] truncate whitespace-nowrap overflow-hidden max-w-[160px]">
                {cat.description}
              </TableCell>
              <TableCell className="w-[10%] text-left">
                <div className="inline-flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(cat)}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className='hidden md:inline'>Editar</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(cat.id, cat.name)}
                  >
                    <Trash className="w-4 h-4" />
                    <span className='hidden md:inline'>Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table> : <NoDataFallback type="categoría" needsCreateLabel={true}/>}
    </div>
  )
}
