import { useState, useRef, useCallback } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface Props {
  /** Data URL (image/...) or (application/pdf) to edit */
  fileUrl: string
  fileName?: string
  onSave: (editedDataUrl: string) => void
  onClose: () => void
}

function isPdf(url: string) { return url.startsWith('data:application/pdf') }

async function getRotatedCroppedImage(imgEl: HTMLImageElement, crop: Crop | undefined, rotateDeg: number, brightness: number, contrast: number): Promise<string> {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported in this browser')

  const scaleX = imgEl.naturalWidth / imgEl.width
  const scaleY = imgEl.naturalHeight / imgEl.height

  const rot = ((rotateDeg % 360) + 360) % 360
  const swap = rot === 90 || rot === 270

  // crop.x/y/width/height are in % of the RENDERED image when unit === '%' — must convert to
  // rendered-pixel coordinates before scaling up to the natural-resolution image, or the
  // extracted region ends up wildly wrong (or degenerate) and can crash the canvas draw.
  const toPx = (val: number, dim: number) => crop?.unit === '%' ? (val / 100) * dim : val

  const cropXpx = crop ? toPx(crop.x, imgEl.width)  : 0
  const cropYpx = crop ? toPx(crop.y, imgEl.height) : 0
  const cropWpx = crop ? toPx(crop.width,  imgEl.width)  : imgEl.width
  const cropHpx = crop ? toPx(crop.height, imgEl.height) : imgEl.height

  const cropX = cropXpx * scaleX
  const cropY = cropYpx * scaleY
  const cropW = Math.max(1, cropWpx * scaleX)
  const cropH = Math.max(1, cropHpx * scaleY)

  const rawOutW = swap ? cropH : cropW
  const rawOutH = swap ? cropW : cropH

  // Cap output resolution — phone camera photos are often 3000-4000px+, but these images are
  // only ever shown as small thumbnails or printed on an A4 document. Saving at full resolution
  // bloats every insert, and every later fetch of that record, for no visible benefit.
  const MAX_DIM = 1600
  const outScale = Math.min(1, MAX_DIM / Math.max(rawOutW, rawOutH))
  const outW = Math.max(1, rawOutW * outScale)
  const outH = Math.max(1, rawOutH * outScale)

  canvas.width  = outW
  canvas.height = outH

  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rot * Math.PI) / 180)
  const drawW = cropW * outScale
  const drawH = cropH * outScale
  ctx.drawImage(imgEl, cropX, cropY, cropW, cropH, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()

  return canvas.toDataURL('image/jpeg', 0.92)
}

export default function DocumentEditor({ fileUrl, fileName = 'document', onSave, onClose }: Props) {
  const pdf = isPdf(fileUrl)
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [rotate, setRotate] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [busy, setBusy] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(fileUrl)
  const [error, setError] = useState('')

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const c = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, width / height, width, height), width, height)
    setCrop(c)
  }

  const applyEdits = useCallback(async () => {
    if (!imgRef.current) return fileUrl
    return getRotatedCroppedImage(imgRef.current, crop, rotate, brightness, contrast)
  }, [crop, rotate, brightness, contrast, fileUrl])

  async function handleSave() {
    setError('')
    setBusy(true)
    try {
      const out = pdf ? fileUrl : await applyEdits()
      onSave(out)
    } catch (err: any) {
      setError('Could not save the edited image: ' + (err?.message || 'unknown error') + '. You can still save the original unedited version.')
    } finally {
      setBusy(false)
    }
  }

  async function handlePreview() {
    if (pdf) return
    setError('')
    setBusy(true)
    try {
      const out = await applyEdits()
      setPreviewUrl(out)
    } catch (err: any) {
      setError('Could not apply edits: ' + (err?.message || 'unknown error'))
    } finally {
      setBusy(false)
    }
  }

  function handleSaveOriginal() { setError(''); onSave(fileUrl) }

  function handlePrint() {
    const win = window.open('', '_blank')
    if (!win) { alert('Allow popups to print'); return }
    if (pdf) {
      win.document.write(`<html><head><title>${fileName}</title></head><body style="margin:0"><embed src="${fileUrl}" width="100%" height="100%" type="application/pdf" /></body></html>`)
    } else {
      win.document.write(`<html><head><title>${fileName}</title><style>@page{margin:0}body{margin:0;display:flex;align-items:center;justify-content:center}img{max-width:100%;max-height:100vh}</style></head><body><img src="${previewUrl}" onload="window.focus();window.print();setTimeout(()=>window.close(),1500)" /></body></html>`)
    }
    win.document.close()
  }

  async function handleShare() {
    try {
      const res = await fetch(pdf ? fileUrl : previewUrl)
      const blob = await res.blob()
      const ext = pdf ? 'pdf' : 'jpg'
      const file = new File([blob], `${fileName}.${ext}`, { type: blob.type })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName })
        return
      }
    } catch { /* fall through to download */ }
    const a = document.createElement('a')
    a.href = pdf ? fileUrl : previewUrl
    a.download = `${fileName}.${pdf ? 'pdf' : 'jpg'}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const btn: React.CSSProperties = { padding:'9px 16px', borderRadius:'9px', fontSize:'12px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:'1px solid rgba(255,255,255,0.14)', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.70)' }
  const btnGold: React.CSSProperties = { ...btn, background:'linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,149,0,0.10))', border:'1.5px solid rgba(255,215,0,0.38)', color:'rgba(255,215,0,0.95)', fontWeight:700 }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.78)', backdropFilter:'blur(10px)', padding:'20px' }}>
      <div style={{ background:'rgba(10,20,32,0.98)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:'18px', width:'min(720px, 100%)', maxHeight:'92vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.6)' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize:'14px', fontWeight:700, color:'rgba(255,255,255,0.92)' }}>{pdf ? '📄 Document' : '🖼️ Edit Image'}</div>
          <button onClick={onClose} style={{ width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', color:'rgba(255,255,255,0.45)', cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:'20px 22px' }}>
          {pdf ? (
            <div style={{ background:'#fff', borderRadius:'10px', overflow:'hidden', height:'420px' }}>
              <embed src={fileUrl} width="100%" height="100%" type="application/pdf" />
            </div>
          ) : (
            <>
              <div style={{ background:'#111', borderRadius:'10px', overflow:'hidden', display:'flex', justifyContent:'center', maxHeight:'420px' }}>
                <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                  <img ref={imgRef} src={fileUrl} onLoad={onImgLoad}
                    style={{ maxHeight:'420px', transform:`rotate(${rotate}deg)`, filter:`brightness(${brightness}%) contrast(${contrast}%)` }} />
                </ReactCrop>
              </div>

              <div style={{ display:'flex', gap:'8px', marginTop:'14px' }}>
                <button style={btn} onClick={() => setRotate(r => (r - 90 + 360) % 360)}>⟲ Rotate Left</button>
                <button style={btn} onClick={() => setRotate(r => (r + 90) % 360)}>⟳ Rotate Right</button>
                <button style={btn} onClick={handlePreview} disabled={busy}>{busy ? 'Applying…' : '👁 Preview edit'}</button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginTop:'16px' }}>
                <div>
                  <div style={{ fontSize:'10px', fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase', color:'rgba(255,255,255,0.40)', marginBottom:'6px' }}>Brightness {brightness}%</div>
                  <input type="range" min={50} max={150} value={brightness} onChange={e => setBrightness(Number(e.target.value))} style={{ width:'100%' }} />
                </div>
                <div>
                  <div style={{ fontSize:'10px', fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase', color:'rgba(255,255,255,0.40)', marginBottom:'6px' }}>Contrast {contrast}%</div>
                  <input type="range" min={50} max={150} value={contrast} onChange={e => setContrast(Number(e.target.value))} style={{ width:'100%' }} />
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{ fontSize:'12px', color:'rgba(239,154,154,0.90)', marginTop:'14px', padding:'10px 13px', background:'rgba(231,76,60,0.10)', borderRadius:'8px', lineHeight:1.5 }}>
              {error}
              <div style={{ marginTop:'8px' }}>
                <button onClick={handleSaveOriginal} style={{ padding:'6px 12px', borderRadius:'7px', fontSize:'11px', fontWeight:600, cursor:'pointer', fontFamily:'inherit', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.16)', color:'rgba(255,255,255,0.80)' }}>Save original (no edits)</button>
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:'10px', marginTop:'20px', flexWrap:'wrap' }}>
            <button style={btn} onClick={handlePrint}>🖨 Print</button>
            <button style={btn} onClick={handleShare}>📤 Share</button>
            <div style={{ flex:1 }} />
            <button style={btn} onClick={onClose}>Cancel</button>
            <button style={btnGold} onClick={handleSave} disabled={busy}>{busy ? 'Saving…' : '✓ Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
