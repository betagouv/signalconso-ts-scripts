import * as fs from 'fs'
import fetch from 'node-fetch'
import csvParser from 'csv-parser'

// fs.createReadStream('/Users/alexandreac/Desktop/reports.txt')
//   .pipe(csvParser({
//     headers: 'id|category|subcategories|company_name|company_address|creation_date|contact_agreement|company_siret|company_postal_code|status|company_id|tags|company_country'.split(
//       '|'),
//     separator: '|',
//   }))
//   .on('data', async (row) => {
//     i++
//     // if (i > 2) process.exit(0)
//     const x = await fetch('http://localhost:9000/api/companies/search/' + row.siret, {
//       'headers': {
//         'accept': 'application/json',
//         'accept-language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7',
//         'cache-control': 'no-cache',
//         'pragma': 'no-cache',
//         'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
//         'sec-ch-ua-mobile': '?0',
//         'sec-fetch-dest': 'empty',
//         'sec-fetch-mode': 'cors',
//         'sec-fetch-site': 'same-site'
//       },
//       'referrer': 'http://localhost:4200/',
//       'referrerPolicy': 'strict-origin-when-cross-origin',
//       'method': 'GET',
//       'mode': 'cors'
//     } as any).then(_ => _.json())
//     console.log(x)
// use row data
// })

;(async () => {
  const columns =
    'id|category|subcategories|company_name|company_address|creation_date|contact_agreement|company_siret|company_postal_code|status|company_id|tags|company_country'.split(
      '|',
    )
  const readStream = fs.createReadStream('/Users/alexandreac/Desktop/reports.txt').pipe(
    csvParser({
      headers: columns,
      separator: '|',
    }),
  )

  let i = 0
  let errors = 0
  let bad = 0
  console.log(columns.join(',') + ',activity_code')
  for await (const chunk of readStream) {
    i++
    if (i > 1 && chunk.company_siret) {
      const x = await fetch('http://localhost:9000/api/companies/search/' + chunk.company_siret, {
        headers: {
          accept: 'application/json',
          'accept-language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          'sec-ch-ua': '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
          'sec-ch-ua-mobile': '?0',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
        },
        referrer: 'http://localhost:4200/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'GET',
        mode: 'cors',
      } as any)
        .then(_ => _.json())
        .catch(err => console.error('HTTP MISS ', chunk, err))
      // console.log(x, chunk)
      try {
        console.log(Object.values(chunk).join(',') + ',' + x?.[0]?.activityCode ?? '')
      } catch (e) {
        errors++
        console.error('=============')
        console.error(chunk, x)
        console.error('-------------')
        throw e
      }
    } else {
      console.log(Object.values(chunk).join(',') + ',')
      bad++
    }
  }
  console.error('ERRORS ::: ', errors, 'BAD ::: ' + bad)
})()
