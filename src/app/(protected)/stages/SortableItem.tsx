// components/SortableItem.tsx
'use client';

import React from 'react';
import {
  useSortable,
  defaultAnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  disabled?: boolean;
  accentColor?: string;
  leftLabel?: React.ReactNode;
  children: React.ReactNode;
}

export function SortableItem({
  id,
  disabled,
  accentColor = '#000000ff',
  leftLabel = id,
  children,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });

  const outerStyle: React.CSSProperties = {
    touchAction: 'none',
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    marginBottom: 8,
    cursor: 'grab',
    opacity: isDragging ? 0.8 : 1,
    boxShadow: isDragging
      ? '0 4px 8px rgba(0,0,0,0.1)'
      : '0 1px 3px rgba(0,0,0,0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    minHeight: 80,
  };

  const leftPanelStyle: React.CSSProperties = {
    backgroundColor: accentColor,
    color: '#fff',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '3rem',
    minWidth: 80,
  };

  const rightContentStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '12px 16px',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div
      ref={setNodeRef}
      style={outerStyle}
      {...attributes}
      {...listeners}
    >
      <div style={leftPanelStyle}>{leftLabel}</div>
      <div style={rightContentStyle}>{children}</div>
    </div>
  );
}
