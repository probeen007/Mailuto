// Block-based email template types

export type BlockType = 'text' | 'image' | 'button' | 'spacer' | 'divider';

export interface BaseBlock {
  id: string;
  type: BlockType;
  order: number;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  content: string; // Supports {{variables}}
  fontSize?: number; // 12-24px
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  color?: string; // hex color
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  imageUrl: string; // HTTPS only
  altText: string;
  linkUrl?: string; // Optional click-through URL
  width?: number; // Max 600px
  alignment?: 'left' | 'center' | 'right';
}

export interface ButtonBlock extends BaseBlock {
  type: 'button';
  label: string; // Supports {{variables}}
  url: string; // Supports {{variables}}
  backgroundColor?: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface SpacerBlock extends BaseBlock {
  type: 'spacer';
  height: number; // 10-100px
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  color?: string;
  thickness?: number; // 1-5px
}

export type EmailBlock = TextBlock | ImageBlock | ButtonBlock | SpacerBlock | DividerBlock;

export interface BlockTemplate {
  name: string;
  subject: string;
  blocks: EmailBlock[];
}

// Validation helpers
export const ALLOWED_VARIABLES = ['name', 'email', 'service', 'date', 'nextDate'];

export const BLOCK_CONSTRAINTS = {
  text: {
    minFontSize: 12,
    maxFontSize: 24,
  },
  image: {
    maxWidth: 600,
    allowedProtocol: 'https:',
  },
  button: {
    maxLabelLength: 50,
  },
  spacer: {
    minHeight: 10,
    maxHeight: 100,
  },
  divider: {
    minThickness: 1,
    maxThickness: 5,
  },
} as const;
