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
  console.log('🚬 ===> :22 ===> CategoryTable ===> data:', data);
  return (
    <div className="overflow-auto">
      {data?.length > 0 ? <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.description}</TableCell>
              <TableCell className="text-right">
                <div className="inline-flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(cat)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(cat.id, cat.name)}
                  >
                    <Trash className="w-4 h-4" />
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
