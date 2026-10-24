/** Merge nested preference patches without dropping sibling settings or copying undefined values. */
export function mergeUserPreferences(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = { ...target };
    for (const [key, sourceValue] of Object.entries(source)) {
        if (sourceValue === undefined || key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }
        const targetValue = result[key];
        const bothPlainObjects =
          typeof sourceValue === 'object' && sourceValue !== null && !Array.isArray(sourceValue) &&
          typeof targetValue === 'object' && targetValue !== null && !Array.isArray(targetValue);
        result[key] = bothPlainObjects ? mergeUserPreferences(targetValue, sourceValue) : sourceValue;
    }
    return result;
}
