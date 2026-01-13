export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  if (!template) return '';
  
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    // Escape special regex characters in the key
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match {{key}} with optional whitespace around the key
    const regex = new RegExp(`\\{\\{\\s*${escapedKey}\\s*\\}\\}`, 'g');
    // Handle null/undefined values and convert to string safely
    const replacement = value != null ? String(value) : '';
    result = result.replace(regex, replacement);
  }
  
  return result;
}

export const DEFAULT_VARIABLES = ['name', 'service', 'nextDate'];

// Get all available variables including custom ones
export function getAvailableVariables(customVariables?: Record<string, string>): string[] {
  const variables = [...DEFAULT_VARIABLES];
  if (customVariables) {
    variables.push(...Object.keys(customVariables));
  }
  return variables;
}

export function validateTemplateVariables(text: string, customVariables?: Record<string, string>): boolean {
  const variableRegex = /\{\{(\w+)\}\}/g;
  const allowedVars = getAvailableVariables(customVariables);
  let match;

  while ((match = variableRegex.exec(text)) !== null) {
    const variable = match[1];
    if (!allowedVars.includes(variable)) {
      return false;
    }
  }
  return true;
}
