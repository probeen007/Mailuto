export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    // Match {{key}} with optional whitespace around the key
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value || '');
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
  const matches = text.matchAll(variableRegex);
  const allowedVars = getAvailableVariables(customVariables);
  
  for (const match of matches) {
    const variable = match[1];
    if (!allowedVars.includes(variable)) {
      return false;
    }
  }
  return true;
}
