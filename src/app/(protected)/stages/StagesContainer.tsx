// app/(protected)/stages/StageContainer.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axiosClient from '@/utils/axiosClient'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableItem } from './SortableItem'

interface Stage {
  id: string
  name: string
  description: string
  color: string
  orderNumber: number
  createdAt: string
  updatedAt: string
}

export default function StageContainer() {
  const [stages, setStages] = useState<Stage[]>([])
  const [sortingEnabled, setSortingEnabled] = useState(false)

  // sensores sólo si sortingEnabled === true
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  useEffect(() => {
    axiosClient
      .get<Stage[]>('/api/stages')
      .then((res) => {
        const sorted = res.data.sort((a, b) => a.orderNumber - b.orderNumber)
        setStages(sorted)
      })
      .catch((err) => {
        console.error('Error fetching stages:', err)
      })
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    if (!sortingEnabled) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      setStages(cur => {
        const oldIndex = cur.findIndex(s=>s.id===active.id)
        const newIndex = cur.findIndex(s=>s.id===over.id)
        return arrayMove(cur, oldIndex, newIndex)
      })
    }
  }

  async function handleSaveOrder() {
    // Prepara payload: id + nuevo orderNumber
    const payload = stages.map((s, idx) => ({
      id: s.id,
      orderNumber: idx + 1,
    }))
    console.log('🚬 ===> :73 ===> payload ===> payload:', payload);

    try {
      await axiosClient.patch('/api/stages/reorder/', payload)
      console.log('Orden guardado')
    } catch (err) {
      console.error('Error guardando orden:', err)
    }
  }

  return (
    <>
      {/* Controles */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setSortingEnabled((e) => !e)}
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: sortingEnabled ? '#fee' : '#eef',
            cursor: 'pointer',
          }}
        >
          {sortingEnabled ? 'Desactivar ordenamiento' : 'Activar ordenamiento'}
        </button>
        <button
          onClick={handleSaveOrder}
          disabled={!sortingEnabled}
          style={{
            padding: '8px 12px',
            borderRadius: 4,
            border: '1px solid #ccc',
            background: sortingEnabled ? '#dfd' : '#ddd',
            cursor: sortingEnabled ? 'pointer' : 'not-allowed',
          }}
        >
          Guardar cambios
        </button>
      </div>

      {/* Zona drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            backgroundColor: '#f4f4f8',
            padding: 12,
            borderRadius: 8,
          }}
        >
          <SortableContext
            items={stages.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {stages.map((stage, idx) => (
              <SortableItem
                key={stage.id}
                id={stage.id}
                disabled={!sortingEnabled}
                accentColor={stage.color}
                leftLabel={idx + 1}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: stage.color,
                      borderRadius: '50%',
                    }}
                  />
                  <strong>{stage.name}</strong> — {stage.description}
                </div>
              </SortableItem>
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </>
  )
}
