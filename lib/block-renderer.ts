/**
 * Email-safe HTML renderer for block-based templates
 * Uses table-based layouts and inline CSS for maximum compatibility
 * Supports Gmail, Outlook, Yahoo, Apple Mail, and mobile clients
 */

import type { EmailBlock, TextBlock, ImageBlock, ButtonBlock, SpacerBlock, DividerBlock } from '@/types/email-blocks';
import { replaceTemplateVariables } from './template-utils';

// Email container with max-width 600px
const EMAIL_CONTAINER_STYLES = `
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #ffffff;
`.trim().replace(/\s+/g, ' ');

/**
 * Renders a text block to email-safe HTML
 */
function renderTextBlock(block: TextBlock, variables: Record<string, string>): string {
  const content = replaceTemplateVariables(block.content, variables);
  const fontSize = block.fontSize || 16;
  const fontWeight = block.fontWeight || 'normal';
  const textAlign = block.textAlign || 'left';
  const color = block.color || '#333333';

  return `
    <tr>
      <td style="padding: 0 20px;">
        <p style="margin: 0; padding: 0; font-size: ${fontSize}px; font-weight: ${fontWeight}; text-align: ${textAlign}; color: ${color}; line-height: 1.6;">
          ${escapeHtml(content)}
        </p>
      </td>
    </tr>
  `;
}

/**
 * Renders an image block to email-safe HTML
 */
function renderImageBlock(block: ImageBlock, variables: Record<string, string>): string {
  const imageUrl = replaceTemplateVariables(block.imageUrl, variables);
  const altText = escapeHtml(replaceTemplateVariables(block.altText, variables));
  const width = Math.min(block.width || 600, 600);
  const alignment = block.alignment || 'center';
  
  const alignStyle = alignment === 'center' ? 'margin: 0 auto;' : 
                     alignment === 'right' ? 'margin-left: auto;' : '';

  const imageHtml = `
    <img src="${escapeHtml(imageUrl)}" 
         alt="${altText}" 
         width="${width}" 
         style="display: block; ${alignStyle} max-width: 100%; height: auto; border: 0;" />
  `;

  const content = block.linkUrl 
    ? `<a href="${escapeHtml(replaceTemplateVariables(block.linkUrl, variables))}" style="text-decoration: none;">${imageHtml}</a>`
    : imageHtml;

  return `
    <tr>
      <td style="padding: 0 20px; text-align: ${alignment};">
        ${content}
      </td>
    </tr>
  `;
}

/**
 * Renders a button block to email-safe HTML
 */
function renderButtonBlock(block: ButtonBlock, variables: Record<string, string>): string {
  const label = replaceTemplateVariables(block.label, variables);
  const url = replaceTemplateVariables(block.url, variables);
  const backgroundColor = block.backgroundColor || '#007bff';
  const textColor = block.textColor || '#ffffff';
  const alignment = block.alignment || 'center';

  return `
    <tr>
      <td style="padding: 0 20px; text-align: ${alignment};">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 ${alignment === 'center' ? 'auto' : alignment === 'right' ? '0 0 0 auto' : '0'};">
          <tr>
            <td style="border-radius: 6px; background-color: ${backgroundColor};">
              <a href="${escapeHtml(url)}" 
                 target="_blank" 
                 style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: bold; color: ${textColor}; text-decoration: none; border-radius: 6px;">
                ${escapeHtml(label)}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Renders a spacer block to email-safe HTML
 */
function renderSpacerBlock(block: SpacerBlock): string {
  const height = Math.max(10, Math.min(block.height, 100));
  
  return `
    <tr>
      <td style="height: ${height}px; line-height: ${height}px; font-size: 1px;">
        &nbsp;
      </td>
    </tr>
  `;
}

/**
 * Renders a divider block to email-safe HTML
 */
function renderDividerBlock(block: DividerBlock): string {
  const color = block.color || '#dddddd';
  const thickness = Math.max(1, Math.min(block.thickness || 1, 5));

  return `
    <tr>
      <td style="padding: 0 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
          <tr>
            <td style="border-top: ${thickness}px solid ${color};"></td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

/**
 * Renders a single block based on its type
 */
function renderBlock(block: EmailBlock, variables: Record<string, string>): string {
  switch (block.type) {
    case 'text':
      return renderTextBlock(block, variables);
    case 'image':
      return renderImageBlock(block, variables);
    case 'button':
      return renderButtonBlock(block, variables);
    case 'spacer':
      return renderSpacerBlock(block);
    case 'divider':
      return renderDividerBlock(block);
    default:
      return '';
  }
}

/**
 * Escapes HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  if (text == null) return '';
  const str = String(text);
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Main function: Renders an array of blocks to complete email HTML
 */
export function renderBlocksToHTML(
  blocks: EmailBlock[],
  variables: Record<string, string> = {}
): string {
  // Sort blocks by order
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  // Render each block
  const blockHtml = sortedBlocks
    .map(block => renderBlock(block, variables))
    .join('\n');

  // Wrap in email-safe container
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse: collapse; border-spacing: 0; margin: 0;}
    div, td {padding: 0;}
    div {margin: 0;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f4f4f4;">
    <tr>
      <td style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="${EMAIL_CONTAINER_STYLES}" role="presentation">
          ${blockHtml}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Renders blocks to plain text (fallback for text-only email clients)
 */
export function renderBlocksToPlainText(
  blocks: EmailBlock[],
  variables: Record<string, string> = {}
): string {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return sortedBlocks
    .map(block => {
      switch (block.type) {
        case 'text':
          return replaceTemplateVariables(block.content, variables);
        case 'button':
          return `[${replaceTemplateVariables(block.label, variables)}](${replaceTemplateVariables(block.url, variables)})`;
        case 'divider':
          return '---';
        case 'spacer':
          return '\n';
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}
