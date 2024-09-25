import * as core from '@actions/core'
import ignore from 'ignore'
import { getAllModules } from './allModules'
import { getChangedModules } from './changedModules'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', { required: true })
    const mode = core.getInput('mode', { required: true })
    const ignored = core.getInput('ignore')
    const monitored = core
      .getInput('monitored')
      .split(',')
      .map((item) => item.trim())

    let modules: string[]

    switch (mode) {
      case 'all':
        modules = await getAllModules(token, monitored)
        break

      case 'changed':
        modules = await getChangedModules(token, monitored)
        break

      default:
        throw new Error(`Unknown mode: ${mode}`)
    }

    if (modules.length && ignored) {
      core.debug(`Found modules before ignore:${modules.map((module) => `\n- ${module}`)}`)
    }
    
    if (ignored) {
      const globs = ignored.split('\n').map((item) => item.trim())
      core.debug(`Globs to ignore: ${globs}`)
      modules = ignore().add(globs).filter(modules)
    }

    if (modules.length) {
      core.debug(`Found modules:${modules.map((module) => `\n- ${module}`)}`)
    } else {
      core.debug('No modules found')
    }

    core.setOutput('modules', modules)
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
