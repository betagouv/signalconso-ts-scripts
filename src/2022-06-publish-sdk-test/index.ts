import fs from 'fs'
import {execSync} from 'child_process'
import path from 'path'
// Scripts to work with the sdk locally
// This script does not commit anything, it is just for local tests
// Careful, it WILL publish the package online, but with a test version number

// 1. Set the sdk version number to a test value (0.0.1-TEST-{timestamp})
// 2. Set the same sdk version in the dashboard and website's package.json
// 3. Then build the sdk and publish it

// One-shot script to migrate a repo from npm to yarn

const SDK_FOLDER = path.resolve('../sdk')
const WEBSITE_FOLDER = path.resolve('../website')
const DASHBOARD_FOLDER = path.resolve('../dashboard')

console.log('Running script to migrate from npm to yarn')

function changeDir(path: string) {
  process.chdir(path)
  console.log('Now working in ' + process.cwd())
}

const TEST_VERSION_NUMBER = `0.0.1-TEST-${Date.now()}`

changeDir(SDK_FOLDER)
editPackageJson(json => (json.version = TEST_VERSION_NUMBER))
changeDir(WEBSITE_FOLDER)
editPackageJson(json => (json.dependencies['@signal-conso/signalconso-api-sdk-js'] = TEST_VERSION_NUMBER))
changeDir(DASHBOARD_FOLDER)
editPackageJson(json => (json.dependencies['@signal-conso/signalconso-api-sdk-js'] = TEST_VERSION_NUMBER))
changeDir(SDK_FOLDER)
runCommand('rm -rf ./lib')
runCommand('npm run build')
runCommand('npm publish')

function editPackageJson(mutate: (json: any) => void): void {
  const PACKAGE_JSON_FILE = 'package.json'
  const json = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE, 'utf-8'))
  mutate(json)
  console.log('Altering package.json')
  fs.writeFileSync(PACKAGE_JSON_FILE, JSON.stringify(json, null, 2), 'utf-8')
}

function runCommand(command: string) {
  console.log('Executing: ' + command)
  execSync(command)
}
// function addLineToFile(filePath: string, line: string) {
//   runCommand(`echo "${line}" >> ${filePath}`)
// }

// runCommand('rm -rf node_modules')
// runCommand('rm -rf package-lock.json')
// // runCommand('nvm use')

// console.log('Removing engines.npm from package.json')
// editPackageJson(json => {
//   if (json.engines) {
//     delete json.engines.npm
//   }
// })

// console.log('Adding yarn as packageManager to package.json')
// editPackageJson(json => {
//   json.packageManager = 'yarn@3.2.1'
// })

// runCommand('yarn')
// addLineToFile('.yarnrc.yml', 'nodeLinker: node-modules')
// runCommand('yarn')
// addLineToFile('.gitignore', '')
// addLineToFile('.gitignore', '# Yarn')
// addLineToFile('.gitignore', '# https://yarnpkg.com/getting-started/qa#which-files-should-be-gitignored')
// addLineToFile('.gitignore', '.yarn/*')
// addLineToFile('.gitignore', '!.yarn/cache')
// addLineToFile('.gitignore', '!.yarn/patches')
// addLineToFile('.gitignore', '!.yarn/plugins')
// addLineToFile('.gitignore', '!.yarn/releases')
// addLineToFile('.gitignore', '!.yarn/sdks')
// addLineToFile('.gitignore', '!.yarn/versions ')
