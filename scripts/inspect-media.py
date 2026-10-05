from pathlib import Path
import subprocess, json, hashlib
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
out = root / 'output' / 'media'
out.mkdir(parents=True, exist_ok=True)
photos = list((root / 'public/images').glob('*.jpeg'))
def sheet(files, name):
    canvas = Image.new('RGB', (1000, ((len(files)+3)//4)*245), '#edf1f4')
    draw = ImageDraw.Draw(canvas)
    for i, (label, path) in enumerate(files):
        im = Image.open(path).convert('RGB')
        im.thumbnail((240, 210))
        x,y=(i%4)*250,(i//4)*245
        canvas.paste(im,(x+(250-im.width)//2,y))
        draw.text((x+6,y+212),label,fill='black')
    canvas.save(out / name)
sheet([(p.name,p) for p in photos], 'photos.jpg')
records=[]
frames=[]
for p in sorted((root/'public/videos').glob('*.mp4')):
    info=json.loads(subprocess.check_output(['ffprobe','-v','quiet','-show_format','-show_streams','-of','json',str(p)]))
    stream=next(s for s in info['streams'] if s['codec_type']=='video')
    duration=float(info['format']['duration'])
    frame=out/(p.stem+'.jpg')
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-ss',str(min(duration*.35,5)),'-i',str(p),'-frames:v','1','-vf','scale=400:-1',str(frame)], check=True)
    records.append({'file':p.name,'duration':duration,'width':stream['width'],'height':stream['height'],'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
    frames.append((p.stem,frame))
sheet(frames,'videos.jpg')
(out/'inventory.json').write_text(json.dumps(records,indent=2))
print(json.dumps({'photos':len(photos),'videos':len(records),'duplicateFiles':len(records)-len(set(r['sha256'] for r in records))}))
