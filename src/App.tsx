import { useState } from 'react'

interface ColorPalette {
  colors: string[]
  description: string
}

function App() {
  const [keyword, setKeyword] = useState('')
  const [palette, setPalette] = useState<ColorPalette | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  // Enhanced mock LLM function for generating color palettes
  const generatePalette = async (keyword: string): Promise<ColorPalette> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // More sophisticated color generation based on keyword analysis
    const colorMaps: Record<string, ColorPalette> = {
      // Nature themes
      ocean: {
        colors: ['#1e3a8a', '#3b82f6', '#06b6d4', '#0891b2', '#164e63'],
        description: '深い海の色合いを表現した青系のパレット'
      },
      sunset: {
        colors: ['#991b1b', '#dc2626', '#f97316', '#fbbf24', '#fef3c7'],
        description: '夕日の温かみを表現したオレンジ・赤系パレット'
      },
      forest: {
        colors: ['#14532d', '#16a34a', '#65a30d', '#84cc16', '#bef264'],
        description: '森の緑豊かな自然を表現したグリーン系パレット'
      },
      
      // Emotions and concepts
      love: {
        colors: ['#be123c', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'],
        description: '愛と情熱を表現したピンク・赤系パレット'
      },
      peace: {
        colors: ['#134e4a', '#0f766e', '#14b8a6', '#5eead4', '#a7f3d0'],
        description: '平和と静寂を表現したティール系パレット'
      },
      energy: {
        colors: ['#a16207', '#ca8a04', '#eab308', '#facc15', '#fef08a'],
        description: 'エネルギーと活力を表現したイエロー系パレット'
      },
      
      // Seasons
      spring: {
        colors: ['#365314', '#65a30d', '#84cc16', '#bef264', '#ecfccb'],
        description: '春の新緑を表現したフレッシュなグリーンパレット'
      },
      summer: {
        colors: ['#1e40af', '#3b82f6', '#06b6d4', '#0891b2', '#67e8f9'],
        description: '夏の空と海を表現したブルー系パレット'
      },
      autumn: {
        colors: ['#92400e', '#d97706', '#f59e0b', '#fbbf24', '#fef3c7'],
        description: '秋の紅葉を表現したオレンジ・アンバー系パレット'
      },
      winter: {
        colors: ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f9fafb'],
        description: '冬の静寂を表現したグレー系パレット'
      }
    }

    // Check for exact matches first
    const lowerKeyword = keyword.toLowerCase()
    if (colorMaps[lowerKeyword]) {
      return colorMaps[lowerKeyword]
    }

    // Generate colors based on keyword characteristics
    const generateColorFromKeyword = (keyword: string): ColorPalette => {
      const hash = keyword.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)

      const hue = Math.abs(hash) % 360
      const colors = []
      
      for (let i = 0; i < 5; i++) {
        const saturation = 70 - (i * 10)
        const lightness = 30 + (i * 15)
        const adjustedHue = (hue + (i * 25)) % 360
        
        // Convert HSL to hex
        const h = adjustedHue / 360
        const s = saturation / 100
        const l = lightness / 100
        
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1/6) return p + (q - p) * 6 * t
          if (t < 1/2) return q
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
          return p
        }
        
        let r, g, b
        if (s === 0) {
          r = g = b = l
        } else {
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s
          const p = 2 * l - q
          r = hue2rgb(p, q, h + 1/3)
          g = hue2rgb(p, q, h)
          b = hue2rgb(p, q, h - 1/3)
        }
        
        const toHex = (c: number) => {
          const hex = Math.round(c * 255).toString(16)
          return hex.length === 1 ? '0' + hex : hex
        }
        
        colors.push(`#${toHex(r)}${toHex(g)}${toHex(b)}`)
      }
      
      return {
        colors,
        description: `「${keyword}」をイメージした調和のとれたパレット`
      }
    }

    return generateColorFromKeyword(keyword)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim()) return

    setIsLoading(true)
    try {
      const generatedPalette = await generatePalette(keyword)
      setPalette(generatedPalette)
    } catch (error) {
      console.error('Error generating palette:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color)
      setCopiedColor(color)
      // Clear the copied state after 2 seconds
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (error) {
      console.error('Failed to copy color:', error)
      // Fallback for browsers that don't support navigator.clipboard
      const textArea = document.createElement('textarea')
      textArea.value = color
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedColor(color)
      setTimeout(() => setCopiedColor(null), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Palette Popper
        </h1>
        <p className="text-center text-gray-600 mb-8">
          キーワードから5色のカラーパレットを生成します
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="キーワードを入力してください（例: ocean, love, spring, energy）"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !keyword.trim()}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '生成中...' : '生成'}
            </button>
          </div>
        </form>

        {palette && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              生成されたパレット
            </h2>
            <p className="text-gray-600 mb-6">
              {palette.description}
            </p>
            
            <div className="grid grid-cols-5 gap-4">
              {palette.colors.map((color, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-full h-24 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg relative"
                    style={{ backgroundColor: color }}
                    onClick={() => copyToClipboard(color)}
                    title={`クリックしてコピー: ${color}`}
                  >
                    {copiedColor === color && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                        <span className="text-white text-sm font-medium">✓ コピー済み</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-2 font-mono">
                    {color}
                  </p>
                  <button
                    onClick={() => copyToClipboard(color)}
                    className={`text-xs mt-1 transition-colors ${
                      copiedColor === color 
                        ? 'text-green-600 font-medium' 
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    {copiedColor === color ? '✓ コピー済み' : '📋 コピー'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
