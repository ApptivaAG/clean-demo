export function normalizeProjectId(value: string): string {
  return value.replace(/[\x00-\x1f\x7f]/g, '').trim();
}

export function validateProjectId(value: string): true | string {
  const projectId = normalizeProjectId(value);

  if (!projectId) {
    return 'Project ID is required';
  }

  // Leave room for the namespace prefix and suffix within Kubernetes' 63-character limit.
  return /^[a-z0-9](?:[a-z0-9-]{0,41}[a-z0-9])?$/.test(projectId)
    ? true
    : 'Use lowercase letters, numbers or internal hyphens, up to 43 characters';
}
