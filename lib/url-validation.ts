// URL and image validation utilities

/**
 * Validates if a URL is properly formatted and uses HTTPS
 */
export function isValidHttpsUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if an image URL is accessible and returns an image
 */
export async function validateImageUrl(url: string): Promise<{ valid: boolean; error?: string }> {
  // First check if it's a valid HTTPS URL
  if (!isValidHttpsUrl(url)) {
    return {
      valid: false,
      error: 'Image URL must use HTTPS protocol',
    };
  }

  try {
    // Attempt to fetch the image header (not the full image)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        valid: false,
        error: `Image not accessible (HTTP ${response.status})`,
      };
    }

    // Check if it's actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return {
        valid: false,
        error: 'URL does not point to an image',
      };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        valid: false,
        error: 'Image URL timed out (took too long to respond)',
      };
    }

    return {
      valid: false,
      error: 'Failed to validate image URL',
    };
  }
}

/**
 * Validates a button/link URL
 */
export function validateLinkUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: true }; // Optional URLs are okay
  }

  try {
    const parsedUrl = new URL(url);
    
    // Allow http and https for links (more flexible than images)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: 'Link URL must use HTTP or HTTPS protocol',
      };
    }

    return { valid: true };
  } catch {
    // Check if it's a variable placeholder
    if (url.includes('{{') && url.includes('}}')) {
      return { valid: true }; // Allow template variables
    }

    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Batch validate all URLs in a block template
 */
export async function validateTemplateBlocks(blocks: any[]): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Validate image blocks
    if (block.type === 'image') {
      if (!block.imageUrl) {
        errors.push(`Block ${i + 1} (image): Image URL is required`);
        continue;
      }

      // Skip validation for template variables
      if (!block.imageUrl.includes('{{')) {
        const imageValidation = await validateImageUrl(block.imageUrl);
        if (!imageValidation.valid) {
          errors.push(`Block ${i + 1} (image): ${imageValidation.error}`);
        }
      }

      // Validate link URL if present
      if (block.linkUrl) {
        const linkValidation = validateLinkUrl(block.linkUrl);
        if (!linkValidation.valid) {
          errors.push(`Block ${i + 1} (image link): ${linkValidation.error}`);
        }
      }
    }

    // Validate button blocks
    if (block.type === 'button') {
      if (!block.url) {
        errors.push(`Block ${i + 1} (button): URL is required`);
        continue;
      }

      const urlValidation = validateLinkUrl(block.url);
      if (!urlValidation.valid) {
        errors.push(`Block ${i + 1} (button): ${urlValidation.error}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
