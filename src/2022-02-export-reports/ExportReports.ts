import {ApiClient, ReportSearch, ReportTag} from '@signal-conso/signalconso-api-sdk-js'
import {config} from '../core/Config'
import {PaginatedData} from '@signal-conso/signalconso-api-sdk-js/lib/model'
import * as fs from 'fs'
import {ReportExt, ReportExtResult, ReportExtSearch, SignalConsoExtSdk} from '../core/SignalConsoExtSdk'
import {stringify} from 'csv-stringify/sync'

const scriptParams: {
  batchSize: number
  outputFilesMaxLine: number
  outputFile: string
  columns: (keyof ReportExt)[]
} = {
  batchSize: 100,
  outputFilesMaxLine: 1000,
  outputFile: '/Users/alexandreac/Workspace/signalconso/signalconso-ts-scripts/bloctel-reports-sample.csv',
  columns: [
    'id',
    'creationDate',
    'category',
    'subcategories',
    'details',
    'postalCode',
    'siret',
    // 'websiteURL',
    'phone',
    'consumerPhone',
    'firstName',
    'lastName',
    'email',
    'contactAgreement',
    'effectiveDate',
    'reponseconsoCode',
    // 'ccrfCode',
    // 'tags',
  ]
}

const apiClient = new ApiClient({
  baseUrl: config.apiBaseUrl + '/api',
  headers: {'X-Api-Key': config.reponseConsoApiToken}
})
const apiSdk = new SignalConsoExtSdk(apiClient)

const forEachReportsBatch = async ({
  filters,
  fn,
  requestBathSize = 1000,
}: {
  filters: Omit<ReportExtSearch, 'limit' | 'offset'>,
  fn: (reports: ReportExtResult) => Promise<void> | void,
  requestBathSize?: number,
}) => {
  let res: PaginatedData<ReportExtResult> | undefined
  let offset = 0
  const limit = requestBathSize
  do {
    res = await apiSdk.search({...filters, limit, offset})
    // await fn(res.entities)
    for (const report of res.entities) {
      await fn(report)
    }
    offset = offset + limit
  } while (res?.hasNextPage)
}

const writeCsvLine = (report: ReportExt): { [K in keyof ReportExt]: string } => {
  const parser: { [K in keyof ReportExt]: (_: ReportExt[K], r: ReportExt) => string } = {
    id: (x) => x,
    creationDate: (x) => x?.toISOString(),
    category: (x) => x,
    subcategories: (x) => JSON.stringify(x),
    details: (x) => JSON.stringify(x),
    postalCode: (x) => x ?? '',
    siret: (x) => x ?? '',
    websiteURL: (x) => x ?? '',
    phone: (x) => x ?? '',
    consumerPhone: (x) => x ?? '',
    firstName: (x) => x,
    lastName: (x) => x,
    email: (x) => x,
    contactAgreement: (x) => '' + x,
    effectiveDate: (x) => x ?? '',
    reponseconsoCode: (x) => JSON.stringify(x),
    ccrfCode: (x) => JSON.stringify(x),
    tags: (x) => JSON.stringify(x),
  }
  return scriptParams.columns.reduce((res, column) => {
    res[column] = parser[column]!((report as any)[column], report)
    return res
  }, {} as { [K in keyof ReportExt]: string })
}

const main = async () => {
  const file = fs.createWriteStream(scriptParams.outputFile)

  file.write(scriptParams.columns.join(',') + '\n')
  await forEachReportsBatch({
    filters: {tags: [ReportTag.Bloctel]},
    fn: res => {
      file.write(stringify([writeCsvLine(res.report)]))
    },
    requestBathSize: scriptParams.batchSize
  }).catch(console.error)
}

main()
