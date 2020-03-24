function formatSpotName (id: string): string {
  return id.split('-').join(' ')
    .split('_').join(' ')
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

export default {
  formatSpotName
}
