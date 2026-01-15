'use client';

import React from 'react';
import {
  Presentation,
  Table,
  Armchair,
  Store,
  DoorOpen,
  DoorClosed,
  Users,
  Wine,
  ClipboardList,
} from 'lucide-react';

interface ElementType {
  type: string;
  label: string;
  icon: React.ReactNode;
}

const elements: ElementType[] = [
  { type: 'stage', label: 'Stage', icon: <Presentation className='w-5 h-5' /> },
  { type: 'table', label: 'Table', icon: <Table className='w-5 h-5' /> },
  { type: 'chair', label: 'Chair', icon: <Armchair className='w-5 h-5' /> },
  { type: 'booth', label: 'Booth', icon: <Store className='w-5 h-5' /> },
  {
    type: 'entrance',
    label: 'Entrance',
    icon: <DoorOpen className='w-5 h-5' />,
  },
  { type: 'exit', label: 'Exit', icon: <DoorClosed className='w-5 h-5' /> },
  { type: 'restroom', label: 'Restroom', icon: <Users className='w-5 h-5' /> },
  { type: 'bar', label: 'Bar', icon: <Wine className='w-5 h-5' /> },
  {
    type: 'registration',
    label: 'Registration',
    icon: <ClipboardList className='w-5 h-5' />,
  },
];

export const ElementToolbar: React.FC = () => {
  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData('elementType', elementType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className='w-64  bg-white border-r border-gray-200 p-4 text-black'>
      <h2 className='text-lg font-semibold mb-4'>Elements</h2>
      <div className='space-y-2'>
        {elements.map((element) => (
          <div
            key={element.type}
            draggable
            onDragStart={(e) => handleDragStart(e, element.type)}
            className='flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 hover:border-gray-300 transition-colors'
          >
            {element.icon}
            <span className='text-sm font-medium'>{element.label}</span>
          </div>
        ))}
      </div>
      <div className='mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
        <p className='text-xs text-blue-800'>
          Drag and drop elements onto the canvas to build your event layout
        </p>
      </div>
    </div>
  );
};
