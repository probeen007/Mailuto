"use client";

import { useState } from "react";
import { Plus, GripVertical, Trash2, Type, Image, MousePointer, Minus, AlignJustify } from "lucide-react";
import type { EmailBlock, TextBlock, ImageBlock, ButtonBlock, SpacerBlock, DividerBlock } from "@/types/email-blocks";

interface BlockEditorProps {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Generate unique ID for new blocks
  const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add a new block
  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = createDefaultBlock(type, blocks.length);
    onChange([...blocks, newBlock]);
  };

  // Remove a block
  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    // Reorder remaining blocks
    const reorderedBlocks = newBlocks.map((block, i) => ({ ...block, order: i }));
    onChange(reorderedBlocks);
  };

  // Update a block
  const updateBlock = (index: number, updates: Partial<EmailBlock>) => {
    const newBlocks = blocks.map((block, i) => 
      i === index ? { ...block, ...updates } as EmailBlock : block
    );
    onChange(newBlocks);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBlocks = [...blocks];
    const draggedBlock = newBlocks[draggedIndex];
    newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(index, 0, draggedBlock);

    // Update order
    const reorderedBlocks = newBlocks.map((block, i) => ({ ...block, order: i }));
    onChange(reorderedBlocks);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Block List */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Type className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 mb-4">No blocks yet. Add your first block below.</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white border rounded-lg p-4 ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <button className="cursor-move mt-1 text-gray-400 hover:text-gray-600">
                  <GripVertical className="w-5 h-5" />
                </button>
                
                <div className="flex-1">
                  {renderBlockEditor(block, index, updateBlock)}
                </div>

                <button
                  onClick={() => removeBlock(index)}
                  className="text-red-500 hover:text-red-700 mt-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Block Buttons */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
        <p className="text-sm font-medium text-gray-700 mb-3">Add Block:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => addBlock('text')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-400 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-700 transition-all"
          >
            <Type className="w-4 h-4" />
            <span>Text</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('image')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-purple-50 border-2 border-gray-200 hover:border-purple-400 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-purple-700 transition-all"
          >
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('button')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-green-50 border-2 border-gray-200 hover:border-green-400 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-green-700 transition-all"
          >
            <MousePointer className="w-4 h-4" />
            <span>Button</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('spacer')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-400 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-orange-700 transition-all"
          >
            <Minus className="w-4 h-4" />
            <span>Spacer</span>
          </button>
          <button
            type="button"
            onClick={() => addBlock('divider')}
            className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-3 py-2.5 bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-400 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 transition-all"
          >
            <AlignJustify className="w-4 h-4" />
            <span>Divider</span>
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-sm">
        <p className="font-semibold text-blue-900 mb-2 flex items-center gap-1.5">
          <span>💡</span>
          <span>Tips:</span>
        </p>
        <ul className="text-blue-700 space-y-1.5 text-xs">
          <li>• Use variables: <code className="bg-white px-1.5 py-0.5 rounded text-blue-800">{"{{name}}"}</code>, <code className="bg-white px-1.5 py-0.5 rounded text-blue-800">{"{{email}}"}</code>, <code className="bg-white px-1.5 py-0.5 rounded text-blue-800">{"{{service}}"}</code>, <code className="bg-white px-1.5 py-0.5 rounded text-blue-800">{"{{date}}"}</code></li>
          <li>• <strong>Spacer blocks</strong> add vertical spacing between content</li>
          <li>• Images must use HTTPS URLs (max width: 600px recommended)</li>
          <li>• Drag the grip icon <GripVertical className="w-3 h-3 inline" /> to reorder blocks</li>
        </ul>
      </div>
    </div>
  );
}

// Render block-specific editor
function renderBlockEditor(
  block: EmailBlock,
  index: number,
  updateBlock: (index: number, updates: Partial<EmailBlock>) => void
) {
  switch (block.type) {
    case 'text':
      return <TextBlockEditor block={block} onChange={(updates) => updateBlock(index, updates)} />;
    case 'image':
      return <ImageBlockEditor block={block} onChange={(updates) => updateBlock(index, updates)} />;
    case 'button':
      return <ButtonBlockEditor block={block} onChange={(updates) => updateBlock(index, updates)} />;
    case 'spacer':
      return <SpacerBlockEditor block={block} onChange={(updates) => updateBlock(index, updates)} />;
    case 'divider':
      return <DividerBlockEditor block={block} onChange={(updates) => updateBlock(index, updates)} />;
  }
}

// Text Block Editor
function TextBlockEditor({ block, onChange }: { block: TextBlock; onChange: (updates: Partial<TextBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
          <Type className="w-4 h-4 text-blue-600" />
        </div>
        <span className="font-semibold text-gray-800">Text Block</span>
      </div>
      
      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Content</label>
        <textarea
          value={block.content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="input min-h-[80px] text-sm"
          placeholder="Enter text (supports {{variables}})"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Size</label>
          <input
            type="number"
            min="12"
            max="32"
            value={block.fontSize || 16}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
            className="input text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Weight</label>
          <select
            value={block.fontWeight || 'normal'}
            onChange={(e) => onChange({ fontWeight: e.target.value as 'normal' | 'bold' })}
            className="input text-sm"
          >
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Align</label>
          <select
            value={block.textAlign || 'left'}
            onChange={(e) => onChange({ textAlign: e.target.value as 'left' | 'center' | 'right' })}
            className="input text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Color</label>
          <input
            type="color"
            value={block.color || '#333333'}
            onChange={(e) => onChange({ color: e.target.value })}
            className="input h-9"
          />
        </div>
      </div>
    </div>
  );
}

// Image Block Editor
function ImageBlockEditor({ block, onChange }: { block: ImageBlock; onChange: (updates: Partial<ImageBlock>) => void }) {
  const [urlError, setUrlError] = useState<string>('');

  const validateImageUrl = (url: string) => {
    if (!url) {
      setUrlError('');
      return;
    }
    
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== 'https:') {
        setUrlError('⚠️ Image URL must use HTTPS');
        return;
      }
      setUrlError('');
    } catch {
      setUrlError('⚠️ Invalid URL format');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center">
          <Image className="w-4 h-4 text-purple-600" />
        </div>
        <span className="font-semibold text-gray-800">Image Block</span>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Image URL <span className="text-red-500">*</span></label>
        <input
          type="url"
          value={block.imageUrl}
          onChange={(e) => {
            onChange({ imageUrl: e.target.value });
            validateImageUrl(e.target.value);
          }}
          className={`input text-sm ${urlError ? 'border-orange-500' : ''}`}
          placeholder="https://example.com/image.jpg"
        />
        {urlError && <p className="text-xs text-orange-600 mt-1">{urlError}</p>}
        {!urlError && block.imageUrl && <p className="text-xs text-green-600 mt-1">✓ HTTPS only, max 600px recommended</p>}
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-1 block">Alt Text (accessibility)</label>
        <input
          type="text"
          value={block.altText}
          onChange={(e) => onChange({ altText: e.target.value })}
          className="input text-sm"
          placeholder="Describe the image"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Width (px)</label>
          <input
            type="number"
            min="100"
            max="600"
            value={block.width || 600}
            onChange={(e) => onChange({ width: parseInt(e.target.value) })}
            className="input text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Align</label>
          <select
            value={block.alignment || 'center'}
            onChange={(e) => onChange({ alignment: e.target.value as 'left' | 'center' | 'right' })}
            className="input text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="sm:col-span-1 col-span-2">
          <label className="text-xs font-medium text-gray-700 mb-1 block">Link URL (optional)</label>
          <input
            type="url"
            value={block.linkUrl || ''}
            onChange={(e) => onChange({ linkUrl: e.target.value })}
            className="input text-sm"
            placeholder="https://example.com"
          />
        </div>
      </div>
    </div>
  );
}

// Button Block Editor
function ButtonBlockEditor({ block, onChange }: { block: ButtonBlock; onChange: (updates: Partial<ButtonBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center">
          <MousePointer className="w-4 h-4 text-green-600" />
        </div>
        <span className="font-semibold text-gray-800">Button Block</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Button Text <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={block.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="input text-sm"
            placeholder="Click Here"
            maxLength={50}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Link URL <span className="text-red-500">*</span></label>
          <input
            type="url"
            value={block.url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="input text-sm"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Background</label>
          <input
            type="color"
            value={block.backgroundColor || '#007bff'}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
            className="input h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Text Color</label>
          <input
            type="color"
            value={block.textColor || '#ffffff'}
            onChange={(e) => onChange({ textColor: e.target.value })}
            className="input h-9"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="text-xs font-medium text-gray-700 mb-1 block">Align</label>
          <select
            value={block.alignment || 'center'}
            onChange={(e) => onChange({ alignment: e.target.value as 'left' | 'center' | 'right' })}
            className="input text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Spacer Block Editor
function SpacerBlockEditor({ block, onChange }: { block: SpacerBlock; onChange: (updates: Partial<SpacerBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center">
            <Minus className="w-4 h-4 text-orange-600" />
          </div>
          <span className="font-semibold text-gray-800">Spacer Block</span>
        </div>
        <span className="text-lg font-bold text-orange-600">{block.height}px</span>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-700 mb-2 block">Vertical Space</label>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          value={block.height}
          onChange={(e) => onChange({ height: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>10px</span>
          <span>50px</span>
          <span>100px</span>
        </div>
      </div>
    </div>
  );
}

// Divider Block Editor
function DividerBlockEditor({ block, onChange }: { block: DividerBlock; onChange: (updates: Partial<DividerBlock>) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
          <AlignJustify className="w-4 h-4 text-gray-600" />
        </div>
        <span className="font-semibold text-gray-800">Divider Block</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Color</label>
          <input
            type="color"
            value={block.color || '#dddddd'}
            onChange={(e) => onChange({ color: e.target.value })}
            className="input h-9"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">Thickness</label>
          <select
            value={block.thickness || 1}
            onChange={(e) => onChange({ thickness: parseInt(e.target.value) })}
            className="input text-sm"
          >
            <option value="1">1px (Thin)</option>
            <option value="2">2px (Medium)</option>
            <option value="3">3px (Thick)</option>
            <option value="4">4px (Bold)</option>
            <option value="5">5px (Heavy)</option>
          </select>
        </div>
      </div>
      <div className="border-t mt-2" style={{ borderColor: block.color || '#dddddd', borderWidth: `${block.thickness || 1}px` }}></div>
    </div>
  );
}

// Helper: Create default block based on type
function createDefaultBlock(type: EmailBlock['type'], order: number): EmailBlock {
  const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        order,
        content: 'Enter your text here...',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#333333',
      };
    case 'image':
      return {
        id,
        type: 'image',
        order,
        imageUrl: '',
        altText: '',
        width: 600,
        alignment: 'center',
      };
    case 'button':
      return {
        id,
        type: 'button',
        order,
        label: 'Click Here',
        url: '',
        backgroundColor: '#007bff',
        textColor: '#ffffff',
        alignment: 'center',
      };
    case 'spacer':
      return {
        id,
        type: 'spacer',
        order,
        height: 30,
      };
    case 'divider':
      return {
        id,
        type: 'divider',
        order,
        color: '#dddddd',
        thickness: 1,
      };
  }
}
