from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request
root=Path(__file__).resolve().parents[1]/'assets/icons'
brands={'googlesearchconsole':'458CF5','meta':'0866FF','facebook':'0866FF','instagram':'E4405F','tiktok':'172657','youtube':'FF0033','github':'172657','wordpress':'21759B','shopify':'7AB55C','canva':'00C4CC','capcut':'172657','openai':'10A37F'}
ui=['lightbulb','globe','play-circle','chart-bar','users','magnifying-glass','article','gear','arrow-up-right','arrow-right','arrow-left','x','list','envelope','graduation-cap','sparkle','pencil-simple','rocket-launch','check-circle','copy','code','camera','folder-open']
def get(item):
 name,url,color=item
 try:
  text=urllib.request.urlopen(url,timeout=20).read().decode()
  assert '<svg' in text
  text=text.replace('<svg ', '<svg fill="#'+color+'" ',1) if 'fill=' not in text.split('>')[0] else text.replace('currentColor','#'+color)
  (root/(name+'.svg')).write_text(text);return name+' OK'
 except Exception as e:return name+' '+str(e)
jobs=[(n,'https://cdn.jsdelivr.net/npm/simple-icons@11.15.0/icons/'+n+'.svg',c) for n,c in brands.items()]+[(n,'https://raw.githubusercontent.com/phosphor-icons/core/main/assets/regular/'+n+'.svg','355cff') for n in ui]
with ThreadPoolExecutor(max_workers=8) as pool:print('\n'.join(pool.map(get,jobs)))
