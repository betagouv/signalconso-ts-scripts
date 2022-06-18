import {Console} from 'console'
import fs from 'fs'
import {execSync} from 'child_process'

// One-shot script to sanitizes a package.json file for another repo
// It looks at all the dependencies listed in the package.json file
// If the version number is an imprecise one (like "^12.3.1" or "latest")
// it will use the "npm list" command to check which version is actually installed (ex: "12.3.2")
// and then it will set this exact version number in the package.json file.

// You probably want to prepare the target folder first with some commands like "nvm use" and "npm install" or "npm ci"

const FOLDER = '../website'

// Additionnal feature :
// These hardcoded dependencies will be added to the package.json
const OTHERS_DEPS_TO_ADD = {
  dependencies: {
    '@sentry/react': '6.19.7',
    '@mui/styled-engine': '5.8.0',
    '@mui/system': '5.8.1',
    '@babel/runtime': '7.18.3',
  },
  devDependencies: {
    '@jest/types': '27.5.1',
  },
}

console.log('Running script to pin exact versions in package.json')

console.log('Targeted folder is ' + FOLDER)
process.chdir(FOLDER)
console.log('Now working in ' + process.cwd())
const PACKAGE_JSON_FILE = 'package.json'
console.log('Reading and parsing file ' + PACKAGE_JSON_FILE)
const json: {
  dependencies: {[k: string]: string}
  devDependencies: {[k: string]: string}
  // there's a bunch of other fields, let's just type one of them
  name: string
} = JSON.parse(fs.readFileSync(PACKAGE_JSON_FILE, 'utf-8'))

const depTypes = ['dependencies', 'devDependencies'] as const

depTypes.forEach(depType => {
  Object.keys(json[depType]).forEach(name => {
    const statedVersion = json[depType][name]
    const command = `npm list ${name} --depth=0 --json`
    const result = JSON.parse(execSync(command, {encoding: 'utf-8'}))
    const exactVersion = result.dependencies[name].version
    console.log(`=> ${name} goes from ${statedVersion} to ${exactVersion} `)
    json[depType][name] = exactVersion
  })
})

depTypes.forEach(depType => {
  Object.entries(OTHERS_DEPS_TO_ADD[depType]).forEach(([name, version]) => {
    console.log(`Adding dependency ${name} ${version}`)
    json[depType][name] = version
  })
})

console.log('Writing result to file ' + PACKAGE_JSON_FILE)
fs.writeFileSync(PACKAGE_JSON_FILE, JSON.stringify(json, null, 2), 'utf-8')
console.log('All done')
