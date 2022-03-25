import {ApiClientApi, DetailInputValue, Id, ReportTag, UploadedFile} from '@signal-conso/signalconso-api-sdk-js'
import {PaginatedData} from '@signal-conso/signalconso-api-sdk-js/lib/model'

export interface ReportExt {
  id: Id,
  creationDate: Date,
  category: string,
  subcategories: string[],
  details: DetailInputValue[],
  postalCode?: string,
  siret?: string,
  websiteURL?: string,
  phone?: string,
  consumerPhone?: string,
  firstName: string,
  lastName: string,
  email: string,
  contactAgreement: Boolean,
  effectiveDate?: string,
  reponseconsoCode: string[],
  ccrfCode: string[],
  tags: ReportTag[]
}

export interface ReportExtResult {
  report: ReportExt
  files: UploadedFile[]
}

export interface ReportExtSearch {
  siret?: string[]
  start?: Date
  end?: Date
  tags?: ReportTag[]
  offset: number
  limit: number
}

export class SignalConsoExtSdk {
  constructor(private client: ApiClientApi) {
  }

  readonly search = (search: ReportExtSearch) => {
    return this.client.get<PaginatedData<ReportExtResult>>(`/ext/v2/reports`, {qs: search})
      .then(res => {
        res.entities.forEach(r => {
          r.report.creationDate = new Date(r.report.creationDate)
        })
        return res
      })
  }
}
