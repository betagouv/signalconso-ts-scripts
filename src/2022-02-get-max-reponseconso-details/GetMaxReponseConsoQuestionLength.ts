import {Report as _Report} from '@signal-conso/signalconso-api-sdk-js'
import axios from 'axios'

interface Report {
  report: _Report
}

const filePath = `/Users/alexandreac/Desktop/reports.csv`

// const maxQuestion = {content: '', id: ''}
// const maxDescription = {content: '', id: ''}
const reachedMaxQuestion: string[] = []
const reachedMaxDescription: string[] = []
const max = 500
let total = 0

;(async () => {

  await axios.get(`https://signal-api.conso.gouv.fr/api/ext/reports?tags=ReponseConso`, {
    headers: {
      'X-Api-Key': 'test'
    },
  })
    .then(_ => _.data)
    .then((res: Report[]) => res.map(_ => _.report))
    .then(reports => {
      reports.map(report => {
        total++
        const votreQuestion = report.details.find(_ => _.label === 'Votre question :')?.value ?? ''
        const description = report.details.find(_ => _.label === 'Description :')?.value ?? ''
        if (votreQuestion.length >= max) {
          reachedMaxQuestion.push(report.id)
        }
        if (description.length >= max) {
          reachedMaxDescription.push(report.id)
        }
      })
    })

  console.log('maxQuestion', reachedMaxQuestion)
  console.log('maxDescription', reachedMaxDescription)
  console.log('')
  console.log('Nombre de signalements avec le champ Votre question full', reachedMaxQuestion.length)
  console.log('Nombre de signalements avec le champ Description full', reachedMaxDescription.length)
  console.log('total', total)
})()
