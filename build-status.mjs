// build-status.mjs — 把她的实时状态写成 status.json（房间页读这个）
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const HOME = process.env.USERPROFILE || homedir()
const OUT = 'D:/Users/Estrella/Documents/projects/whale-room/status.json'

function readJson(p, fallback) {
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return fallback }
}
function readText(p) {
  try { return readFileSync(p, 'utf8') } catch { return '' }
}

const today = new Date().toISOString().slice(0, 10)

// QQ：网关日志里她今天说了几句
let qqToday = 0
try {
  const log = readText(join(HOME, '.dsh', 'whale-gateway.log'))
  const lines = log.split('\n').filter((l) => l.includes('say done') && l.includes(today))
  qqToday = lines.length
} catch {}

// 抖音：今天的运行分钟数 & 看过多少条
const dutyState = readJson(join(HOME, '.dsh', 'douyin-duty', 'state.json'), {})
const douyinMinutes = Math.round(((dutyState.scrolledSec || 0) / 60) * 10) / 10

// 记忆：条数
const memStore = readJson(join(HOME, '.dsh', 'whale-memory-store', 'memory-state.json'), null)
const ownerState = memStore && memStore.owner ? memStore.owner : null
const facts = ownerState && Array.isArray(ownerState.facts) ? ownerState.facts.length : null
const memArchive = readJson(join(HOME, '.dsh', 'whale-memory-archive', today, 'facts.json'), null)
const memCount = facts ?? (Array.isArray(memArchive) ? memArchive.length : 0)

const status = {
  updatedAt: new Date().toISOString(),
  qqToday,
  douyinMinutes,
  memory: memCount,
  awake: true,
}
writeFileSync(OUT, JSON.stringify(status, null, 2), 'utf8')
console.log(JSON.stringify(status))
