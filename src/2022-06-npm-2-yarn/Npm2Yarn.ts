import {Console} from 'console'
import fs from 'fs'
import {execSync} from 'child_process'

// One-shot script to migrate a repo from npm to yarn

const FOLDER = '../website'

console.log('Running script to migrate from npm to yarn')

console.log('Targeted folder is ' + FOLDER)
process.chdir(FOLDER)
console.log('Now working in ' + process.cwd())

const PACKAGE_JSON_FILE = 'package.json'

function editPackageJson(mutate: (json: any) => void): void {
  const json = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE, 'utf-8'))
  mutate(json)
  fs.writeFileSync(PACKAGE_JSON_FILE, JSON.stringify(json, null, 2), 'utf-8')
}

function runCommand(command: string) {
  console.log('Executing: ' + command)
  execSync(command)
}
function addLineToFile(filePath: string, line: string) {
  runCommand(`echo "${line}" >> ${filePath}`)
}

runCommand('rm -rf node_modules')
runCommand('rm -rf package-lock.json')
runCommand('nvm use')

console.log('Removing engines.npm from package.json')
editPackageJson(json => {
  if (json.engines) {
    delete json.engines.npm
  }
})

console.log('Adding yarn as packageManager to package.json')
editPackageJson(json => {
  json.packageManager = 'yarn@3.2.1'
})

runCommand('yarn')
addLineToFile('.yarnrc.yml', 'nodeLinker: node-modules')
runCommand('yarn')
addLineToFile('.gitignore', '')
addLineToFile('.gitignore', '# Yarn')
addLineToFile('.gitignore', '# https://yarnpkg.com/getting-started/qa#which-files-should-be-gitignored')
addLineToFile('.gitignore', '.yarn/*')
addLineToFile('.gitignore', '!.yarn/cache')
addLineToFile('.gitignore', '!.yarn/patches')
addLineToFile('.gitignore', '!.yarn/plugins')
addLineToFile('.gitignore', '!.yarn/releases')
addLineToFile('.gitignore', '!.yarn/sdks')
addLineToFile('.gitignore', '!.yarn/versions ')
