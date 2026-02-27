// DJB2 哈希算法
const djb2 = (str: string): number => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i)
  }
  return Math.abs(hash)
}

const COLORS = {
  warm: ['#FF6B6B', '#FF9F43', '#FECA57', '#FF9FF3', '#F368E0'],
  cool: ['#54A0FF', '#2E86DE', '#00D2D3', '#1DD1A1', '#5F27CD'],
}

// 扁平头像的简单 SVG 模板
const generateSvg = (index: number, type: 'warm' | 'cool') => {
  const bg =
    type === 'warm'
      ? COLORS.warm[index % COLORS.warm.length]
      : COLORS.cool[index % COLORS.cool.length]

  // 简单的几何面孔
  const svg = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="${bg}"/>
  <circle cx="35" cy="40" r="8" fill="rgba(255,255,255,0.9)"/>
  <circle cx="65" cy="40" r="8" fill="rgba(255,255,255,0.9)"/>
  <path d="M30 65 Q50 85 70 65" stroke="rgba(255,255,255,0.9)" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>
  `.trim()

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const AVATARS: string[] = []

// 生成 20 个头像（10 个暖色，10 个冷色）
for (let i = 0; i < 10; i++) AVATARS.push(generateSvg(i, 'warm'))
for (let i = 0; i < 10; i++) AVATARS.push(generateSvg(i, 'cool'))

export const getAvatarIndex = (name: string): number => {
  return djb2(name) % 20
}

export const getAvatar = (name: string): string => {
  return AVATARS[getAvatarIndex(name)]
}
