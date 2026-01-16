'use client';

import React from 'react';
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
  GripVertical,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ElementType {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  category: 'venue' | 'seating' | 'services';
}

const elements: ElementType[] = [
  // Venue elements
  { type: 'stage', label: 'Stage', icon: <Presentation className='w-4 h-4' />, color: 'bg-blue-500', category: 'venue' },
  { type: 'entrance', label: 'Entrance', icon: <DoorOpen className='w-4 h-4' />, color: 'bg-emerald-500', category: 'venue' },
  { type: 'exit', label: 'Exit', icon: <DoorClosed className='w-4 h-4' />, color: 'bg-red-500', category: 'venue' },
  // Seating elements
  { type: 'table', label: 'Table', icon: <Table className='w-4 h-4' />, color: 'bg-amber-500', category: 'seating' },
  { type: 'chair', label: 'Chair', icon: <Armchair className='w-4 h-4' />, color: 'bg-zinc-500', category: 'seating' },
  { type: 'booth', label: 'Booth', icon: <Store className='w-4 h-4' />, color: 'bg-purple-500', category: 'seating' },
  // Service elements
  { type: 'registration', label: 'Registration', icon: <ClipboardList className='w-4 h-4' />, color: 'bg-cyan-500', category: 'services' },
  { type: 'bar', label: 'Bar', icon: <Wine className='w-4 h-4' />, color: 'bg-orange-500', category: 'services' },
  { type: 'restroom', label: 'Restroom', icon: <Bath className='w-4 h-4' />, color: 'bg-slate-500', category: 'services' },
];

const categories = [
  { id: 'venue', label: 'Venue' },
  { id: 'seating', label: 'Seating' },
  { id: 'services', label: 'Services' },
] as const;

export const ElementToolbar: React.FC = () => {
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData('elementType', elementType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className='w-56 bg-white border-r flex flex-col'>
        {/* Header */}
        <div className='p-4 border-b'>
          <h2 className='font-semibold text-zinc-900'>Elements</h2>
          <p className='text-xs text-zinc-500 mt-1'>Drag onto canvas</p>
        </div>

        {/* Elements by category */}
        <div className='flex-1 overflow-y-auto p-3 space-y-4'>
          {categories.map((category) => (
            <div key={category.id}>
              <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2 px-1'>
                {category.label}
              </h3>
              <div className='space-y-1'>
                {elements
                  .filter((el) => el.category === category.id)
                  .map((element) => (
                    <Tooltip key={element.type}>
                      <TooltipTrigger asChild>
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, element.type)}
                          className='flex items-center gap-3 p-2.5 rounded-lg cursor-grab hover:bg-zinc-50 active:cursor-grabbing transition-colors group border border-transparent hover:border-zinc-200'
                        >
                          <div className={`w-8 h-8 rounded-md ${element.color} flex items-center justify-center text-white shadow-sm`}>
                            {element.icon}
                          </div>
                          <span className='text-sm font-medium text-zinc-700 flex-1'>{element.label}</span>
                          <GripVertical className='w-4 h-4 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity' />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Drag to add {element.label.toLowerCase()}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Help tip */}
        <div className='p-3 border-t bg-zinc-50'>
          <p className='text-xs text-zinc-500 leading-relaxed'>
            <span className='font-medium text-zinc-600'>Tip:</span> Click an element on canvas to select it, then drag to move or resize.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};
