import 'dotenv/config'
import {defaultValue, env as initEnv} from '@alexandreannic/ts-utils'

enum Env {
  REPONSE_CONSO_API_TOKEN = 'REPONSE_CONSO_API_TOKEN',
  API_BASE_URL = 'API_BASE_URL'
}

const env = initEnv(process.env)

const parseUrl = (_: string): string => _.replace(/\/$/, '')

export const config = {
  reponseConsoApiToken: env()(Env.REPONSE_CONSO_API_TOKEN),
  apiBaseUrl: env(defaultValue('http://localhost:9000'), parseUrl)(Env.API_BASE_URL),
}

console.log('CONFIG', config)
