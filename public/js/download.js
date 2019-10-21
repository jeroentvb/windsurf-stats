const downloadCsv = document.getElementById('download-csv')
const downloadJson = document.getElementById('download-json')

if (downloadCsv) {
  downloadCsv.addEventListener('click', () => {
    window.open('/download-sessions?type=csv')
  })
}

if (downloadJson) {
  downloadJson.addEventListener('click', () => {
    window.open('/download-sessions?type=json')
  })
}
