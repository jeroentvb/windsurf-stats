function formatSpotName (id: string): string {
  return id.split('-').join(' ')
    .split('_').join(' ')
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

function getSailSize (sail: string): number {
  const splitSail = sail.split(' ')

  return parseFloat(splitSail[splitSail.length - 1])
}

export default {
  formatSpotName,
  getSailSize
}
