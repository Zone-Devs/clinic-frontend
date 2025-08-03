'use client'

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import NoDataFallback from '@/app/components/NoDataFallback'

export interface Equipment {
  id: string
  name: string
  description: string
  model: string
  createdAt?: any
  createdLocalTime?: any
  updatedAt?: any
  updatedLocalTime?: any
}

interface EquipmentTableProps {
  data: Equipment[]
  onEdit: (category: Equipment) => void
  onDelete: (id: string, name: string) => void
}

export function EquipmentTable({ data, onEdit, onDelete }: EquipmentTableProps) {
  return (
    <div className="overflow-x-auto w-full max-w-full">
      {data?.length > 0 ? <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%] bg-primary text-primary-foreground border-r border-primary-foreground">Nombre</TableHead>
            <TableHead className="w-[30%] bg-primary text-primary-foreground border-r border-primary-foreground">Modelo</TableHead>
            <TableHead className="w-[30%] bg-primary text-primary-foreground border-r border-primary-foreground">Descripción</TableHead>
            <TableHead className="w-[10%] bg-primary text-primary-foreground text-left">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((cat) => (
            <TableRow key={cat.id} className="odd:bg-muted min-w-0">
              <TableCell className="w-[30%] truncate whitespace-nowrap overflow-hidden max-w-[70px]">
                {cat.name}
              </TableCell>
              <TableCell className="w-[30%] truncate whitespace-nowrap overflow-hidden max-w-[160px]">
                {cat.model}
              </TableCell>
              <TableCell className="w-[30%] truncate whitespace-nowrap overflow-hidden max-w-[160px]">
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
                    className='bg-red-500 text-white'
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
      </Table> : <NoDataFallback pronoun="un" type="equipo" needsCreateLabel={true}/>}
    </div>
  )
}
