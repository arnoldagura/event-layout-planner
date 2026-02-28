'use client';

import React, { useState } from 'react';
import {
  useCanvasStore,
  type CanvasElement as CanvasElementType,
} from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  Presentation,
  Table,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Bath,
  Wine,
  ClipboardList,
  X,
} from 'lucide-react';

interface Props {
  element: CanvasElementType;
}

const elementConfig: Record<
  string,
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
    icon: React.ReactNode;
  }
> = {
  stage: {
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-700',
    icon: <Presentation className='w-4 h-4' />,
  },
  table: {
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-700',
    icon: <Table className='w-4 h-4' />,
  },
  chair: {
    bgColor: 'bg-zinc-100',
    borderColor: 'border-zinc-400',
    textColor: 'text-zinc-700',
    icon: <Armchair className='w-4 h-4' />,
  },
  booth: {
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-700',
    icon: <Store className='w-4 h-4' />,
  },
  entrance: {
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-700',
    icon: <DoorOpen className='w-4 h-4' />,
  },
  exit: {
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
    textColor: 'text-red-700',
    icon: <DoorClosed className='w-4 h-4' />,
  },
  restroom: {
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-700',
    icon: <Bath className='w-4 h-4' />,
  },
  bar: {
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-700',
    icon: <Wine className='w-4 h-4' />,
  },
  registration: {
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-700',
    icon: <ClipboardList className='w-4 h-4' />,
  },
};

export const CanvasElement: React.FC<Props> = ({ element }) => {
  const {
    updateElementSilent,
    selectElement,
    selectedElement,
    deleteElement,
    _setPendingSnapshot,
    commitHistory,
  } = useCanvasStore();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const isSelected = selectedElement === element.id;
  const config = elementConfig[element.type] || {
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    textColor: 'text-gray-700',
    icon: null,
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
    _setPendingSnapshot();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateElementSilent(element.id, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isResizing) {
      const newWidth = Math.max(
        30,
        resizeStart.width + (e.clientX - resizeStart.x)
      );
      const newHeight = Math.max(
        30,
        resizeStart.height + (e.clientY - resizeStart.y)
      );
      updateElementSilent(element.id, {
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      commitHistory();
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    _setPendingSnapshot();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElement(element.id);
  };

  return (
    <div
      className={cn(
        'absolute border-2 cursor-move flex flex-col items-center justify-center rounded-md transition-shadow',
        config.bgColor,
        config.borderColor,
        isSelected && 'ring-2 ring-zinc-900 ring-offset-2 shadow-lg',
        isDragging && 'opacity-80 shadow-xl'
      )}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        transform: `rotate(${element.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      {element.width > 50 && element.height > 50 && (
        <div className={cn('mb-1', config.textColor)}>{config.icon}</div>
      )}

      <span
        className={cn(
          'pointer-events-none truncate px-1 font-medium',
          config.textColor,
          element.width > 60 ? 'text-xs' : 'text-[10px]'
        )}
      >
        {element.name}
      </span>

      {isSelected && (
        <>
          <div
            className='absolute -bottom-1 -right-1 w-3 h-3 bg-zinc-900 rounded-sm cursor-se-resize shadow-sm'
            onMouseDown={handleResizeMouseDown}
          />

          <div className='absolute -top-1 -left-1 w-2 h-2 bg-zinc-900 rounded-sm' />
          <div className='absolute -top-1 -right-1 w-2 h-2 bg-zinc-900 rounded-sm' />
          <div className='absolute -bottom-1 -left-1 w-2 h-2 bg-zinc-900 rounded-sm' />
        </>
      )}
    </div>
  );
};
