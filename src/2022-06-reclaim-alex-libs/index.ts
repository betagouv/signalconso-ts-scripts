import {Console} from 'console'
import fs from 'fs'
import path from 'path'
import {execSync} from 'child_process'

// One-shot script replaces imports from '@alexandreannic/..' and 'mui-extension' and 'react-persistent-state' to a local relative path

const SRC_FOLDER = '../dashboard/src'
const PATH_TO_ALEX_LIBS_FROM_SRC = './alexlibs'

console.log('Moving to target folder ' + SRC_FOLDER)
process.chdir(SRC_FOLDER)
console.log('Now working in ' + process.cwd())
const fullPathToAlexLibs = path.resolve(process.cwd(), PATH_TO_ALEX_LIBS_FROM_SRC)

const isDir = (fullPath: string) => fs.lstatSync(fullPath).isDirectory()
const getContents = (fullPath: string) => fs.readdirSync(fullPath).map(_ => path.resolve(fullPath, _))
const getRelativePathToAlexLibsFromDepth = (depth: number): string => {
  if (depth === 0) {
    return PATH_TO_ALEX_LIBS_FROM_SRC
  }
  if (depth === 1) {
    return '../' + PATH_TO_ALEX_LIBS_FROM_SRC.replace('./', '')
  }
  return '../' + getRelativePathToAlexLibsFromDepth(depth - 1)
}

{
  // Adjust imports alexandreannic

  function recurse(fullPath: string, currentDepth: number) {
    if (fullPath !== fullPathToAlexLibs) {
      getContents(fullPath).forEach(item => {
        if (isDir(item)) {
          recurse(item, currentDepth + 1)
        } else {
          const fileContent = fs.readFileSync(item, 'utf-8')
          const fileContentReplaced = (fileContent as any)
            .replaceAll('@alexandreannic', getRelativePathToAlexLibsFromDepth(currentDepth))
            .replaceAll(/ts-utils\/.*'/g, "ts-utils'")
            .replaceAll(/react-hooks-lib\/.*'/g, "react-hooks-lib'")
            .replaceAll(/'mui-extension.*'/g, "'" + getRelativePathToAlexLibsFromDepth(currentDepth) + "/mui-extension'")
            .replaceAll(
              /'react-persistent-state.*'/g,
              "'" + getRelativePathToAlexLibsFromDepth(currentDepth) + "/react-persistent-state'",
            )
          if (fileContent != fileContentReplaced) {
            console.log('Adjusted file', item)
            fs.writeFileSync(item, fileContentReplaced, 'utf-8')
          }
        }
      })
    }
  }

  recurse(process.cwd(), 0)
}

{
  // Removes *.spec.ts from alexlibs

  function recurse(fullPath: string) {
    getContents(fullPath).forEach(item => {
      if (isDir(item)) {
        recurse(item)
      } else {
        if (item.endsWith('.spec.ts')) {
          console.log('Removing', item)
          fs.rmSync(item)
        }
      }
    })
  }

  recurse(fullPathToAlexLibs)
}
