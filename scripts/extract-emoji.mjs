// Script de build (não roda no app em produção): varre o código-fonte em busca de
// emoji usados na interface e no banco de tarefas, encontra o PNG correspondente do
// Twemoji (pacote emoji-datasource-twitter, licença CC-BY 4.0) e gera um módulo TS
// com esses PNGs em base64 — usados para desenhar ícones reais e coloridos no PDF
// (em vez de formas vetoriais), já que fontes de PDF não renderizam emoji.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcDir = join(root, 'src')
const imgDir = join(root, 'node_modules/emoji-datasource-twitter/img/twitter/64')

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) walk(p, files)
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(p)
  }
  return files
}

const files = walk(srcDir)
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
const isPictographic = (cp) => /\p{Extended_Pictographic}/u.test(String.fromCodePoint(cp))

const emojiSet = new Set()
for (const file of files) {
  const content = readFileSync(file, 'utf8')
  for (const { segment } of segmenter.segment(content)) {
    const codepoints = Array.from(segment).map((c) => c.codePointAt(0))
    if (codepoints.some(isPictographic)) emojiSet.add(segment)
  }
}

console.log(`Found ${emojiSet.size} unique emoji graphemes in source.`)

function codepointsHex(emoji) {
  return Array.from(emoji).map((c) => c.codePointAt(0).toString(16))
}

function findAsset(emoji) {
  const cps = codepointsHex(emoji)
  const candidates = [
    cps.join('-'),
    cps.filter((c) => c !== 'fe0f').join('-'),
    cps[0],
  ]
  for (const c of candidates) {
    const p = join(imgDir, `${c}.png`)
    if (existsSync(p)) return p
  }
  return null
}

const map = {}
const missing = []
for (const emoji of emojiSet) {
  const assetPath = findAsset(emoji)
  if (!assetPath) {
    missing.push(emoji)
    continue
  }
  const base64 = readFileSync(assetPath).toString('base64')
  map[emoji] = base64
}

console.log(`Resolved ${Object.keys(map).length} emoji, missing ${missing.length}:`, missing.join(' '))

const out = `// Arquivo gerado automaticamente por scripts/extract-emoji.mjs — não editar à mão.
// Ícones reais (Twemoji, CC-BY 4.0 — https://github.com/twitter/twemoji) em base64,
// usados para desenhar imagens de verdade nos PDFs gerados (jsPDF não renderiza emoji
// como texto, pois fontes padrão de PDF não têm esses glifos).
export const EMOJI_PNG_BASE64: Record<string, string> = ${JSON.stringify(map)}
`
writeFileSync(join(srcDir, 'lib', 'emojiAssets.generated.ts'), out)
console.log('Wrote src/lib/emojiAssets.generated.ts')
