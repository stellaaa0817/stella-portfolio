const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { JSDOM } = require(process.env.STELLA_JSDOM || 'jsdom');
const root = path.resolve(__dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'), {runScripts:'outside-only',url:'https://portfolio.test/'});
const {window:w} = dom;
w.matchMedia = () => ({matches:false});
w.IntersectionObserver = class { observe(){} disconnect(){} };
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
for(const file of ['portfolio-data.js','script.js','hero-home.js','i18n.js']) w.eval(fs.readFileSync(path.join(root,file),'utf8'));
const doc=w.document;
assert.equal(doc.querySelectorAll('.project').length,5);
assert.equal(doc.querySelectorAll('.project.wide').length,1);
assert.equal(doc.querySelectorAll('#about-tools .tool-chip').length,10);
assert.equal(doc.querySelector('#contact-method a').getAttribute('href'),'mailto:stellaaa0817@gmail.com');
assert.equal(doc.querySelector('a[href^="tel:"]').getAttribute('href'),'tel:+8615979799955');
assert.equal(doc.querySelector('a[href^="https://wa.me/"]').getAttribute('href'),'https://wa.me/8615979799955');
assert.equal(doc.querySelector('[data-copy-wechat]').dataset.copyWechat,'wx20010817');
assert.equal(doc.querySelector('.contact-orb'),null);
assert.equal(doc.querySelector('#contact h2').textContent.replace(/\s+/g,''),'Havesomethinginmind?Let’stalk.');
assert.equal(doc.querySelector('.stella-hero h1').textContent.replace(/\s+/g,''),'Hello,I’mStella.');
assert.equal(doc.querySelector('#main-navigation').querySelectorAll('a').length,4);
doc.querySelector('.language-toggle').click();
assert.equal(doc.documentElement.lang,'zh-CN');
assert.equal(doc.querySelector('.language-toggle span').textContent,'EN');
assert.equal(doc.querySelector('#contact h2').textContent.replace(/\s+/g,''),'有项目，有想法？来聊聊。');
doc.querySelector('.language-toggle').click();
assert.equal(doc.documentElement.lang,'en');
assert.equal(doc.querySelector('#contact h2').textContent.replace(/\s+/g,''),'Havesomethinginmind?Let’stalk.');
const assets = new Set();
function checkAssets(){for(const element of doc.querySelectorAll('img[src],script[src],link[rel=stylesheet]')){const source=element.getAttribute('src')||element.getAttribute('href');if(!source||source.startsWith('http')) continue;assets.add(source);}}
checkAssets();
for(const project of w.PORTFOLIO.projects){
 const button=doc.querySelector(`.project-link[data-project="${project.id}"]`);button.click();
 assert.ok(doc.querySelector('#project-detail').open);
 assert.equal(doc.querySelector('#detail-title').textContent,project.title);
 assert.ok(doc.querySelector('.detail-columns').textContent.includes(project.detailContent.contributions[0]));
 assert.equal(doc.querySelectorAll('.detail-story section').length,2);
 assert.ok(doc.querySelector('.see-work').compareDocumentPosition(doc.querySelector('.detail-columns')) & w.Node.DOCUMENT_POSITION_FOLLOWING);
 assert.ok(doc.querySelector('.detail-outcome').textContent.includes(project.detailContent.outcome));
 assert.equal(doc.querySelectorAll('.verified-result').length,0);
 checkAssets();
 if(project.id==='content'){
  assert.equal(doc.querySelectorAll('#creative-media .media-pending').length,6);
  doc.querySelector('[data-filter="Video Content"]').click();
  assert.equal(doc.querySelectorAll('#creative-media .media-pending').length,3);
  doc.querySelector('[data-filter="Social Media Posts"]').click();
  assert.equal(doc.querySelectorAll('#creative-media .media-pending').length,1);
 }
 doc.querySelector('.dialog-close').click();
 assert.equal(doc.querySelector('#project-detail').open,false);
 assert.equal(doc.body.classList.contains('detail-open'),false);
}
doc.querySelector('.menu-toggle').click();assert.equal(doc.querySelector('.menu-toggle').getAttribute('aria-expanded'),'true');
doc.querySelector('#main-navigation a').click();assert.equal(doc.querySelector('.menu-toggle').getAttribute('aria-expanded'),'false');
for(const anchor of doc.querySelectorAll('a[href^="#"]')) assert.ok(doc.querySelector(anchor.hash),`Missing anchor ${anchor.hash}`);
for(const asset of assets) assert.ok(fs.existsSync(path.join(root,asset)),`Missing local asset ${asset}`);
console.log(`PASS: 5 project dialogs; creative filters; 10 tools; contact email; navigation; ${assets.size} local assets. Native layout/hover rendering is not tested by this DOM check.`);
doc.querySelector('.language-toggle').click();
doc.querySelector('.project-link[data-project="website"]').click();
setTimeout(() => {
  assert.equal(doc.documentElement.lang,'zh-CN');
  assert.equal(doc.querySelector('#detail-title').textContent,'网站与品牌建设');
  assert.ok(doc.querySelector('#detail-content').textContent.includes('查看作品'));
  console.log('PASS: Chinese navigation, contact copy, and dynamically rendered project details.');
},0);
