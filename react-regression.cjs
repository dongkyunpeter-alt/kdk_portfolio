const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[]; const failed=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>failed.push(`${request.method()} ${request.url()} ${request.failure()?.errorText}`));
  page.on('response',response=>{if(response.status()>=400)failed.push(`${response.status()} ${response.url()}`)});

  await page.goto('http://127.0.0.1:4392/index.html',{waitUntil:'networkidle'});
  await page.evaluate(()=>localStorage.removeItem('kdk-project-bones-v2')); await page.reload({waitUntil:'networkidle'});
  assert.equal(await page.locator('#main').count(),1);
  assert.equal(await page.locator('.project-card').count(),3);
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('.hero-grid>div:first-child').getAttribute('class'),'motion-ready is-visible');
  assert.equal(await page.locator('.hero-desc').evaluate(node=>getComputedStyle(node).opacity),'1');
  const bonePosition=await page.evaluate(()=>{const dog=document.querySelector('#mungi').getBoundingClientRect(),bone=document.querySelector('.bone').getBoundingClientRect();return {x:(bone.left+bone.width/2)-(dog.left+dog.width/2),y:(bone.top+bone.height/2)-(dog.top+dog.height/2)}});
  const move=async(key,distance)=>{await page.keyboard.down(key);await page.waitForTimeout(Math.abs(distance)/5.4*17+80);await page.keyboard.up(key)};
  await move(bonePosition.x>0?'ArrowRight':'ArrowLeft',bonePosition.x); await move(bonePosition.y>0?'ArrowDown':'ArrowUp',bonePosition.y); await page.waitForTimeout(250);
  assert.equal(await page.locator('.bone').count(),2);
  await page.getByRole('button',{name:'뼈 바로 받기'}).click(); await page.mouse.move(1050,650); await page.waitForTimeout(450);
  assert.equal(await page.locator('.cursor-mongi.show').count(),1);
  assert.match(await page.locator('.cursor-mongi').evaluate(node=>node.style.transform),/translate3d/);

  await page.setViewportSize({width:390,height:844}); await page.reload({waitUntil:'networkidle'});
  await page.locator('#menu').click(); assert.equal(await page.locator('#nav').getAttribute('class'),'nav common-nav open');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);

  await page.setViewportSize({width:1440,height:900}); await page.goto('http://127.0.0.1:4392/pulmuone.html',{waitUntil:'networkidle'});
  assert.equal(await page.locator('#work-track .project-card').count(),18);
  assert.equal(await page.locator('#work-track .project-card[aria-hidden="false"] a').count(),6);
  const before=await page.locator('#work-track').evaluate(node=>node.style.transform); await page.locator('#work-next').click(); await page.waitForTimeout(150); const during=await page.locator('#work-track').evaluate(node=>node.style.transform); assert.notEqual(before,during);
  const cards=page.locator('#work-cards'); await cards.scrollIntoViewIfNeeded(); const box=await cards.boundingBox(); const dragBefore=await page.locator('#work-track').evaluate(node=>node.style.transform); await page.mouse.move(box.x+box.width*.7,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.25,box.y+box.height*.5,{steps:8});const dragDuring=await page.locator('#work-track').evaluate(node=>node.style.transform);await page.mouse.up();assert.notEqual(dragBefore,dragDuring);
  const detail=page.locator('.accordion details').nth(1);await detail.locator('summary').click();assert.equal(await detail.evaluate(node=>node.open),true);assert.equal(await detail.locator('.accordion-content').evaluate(node=>getComputedStyle(node).animationName),'accordion-open');
  await page.evaluate(()=>scrollTo(0,900));await page.waitForTimeout(150);assert.equal(await page.locator('#back-to-top').evaluate(node=>node.classList.contains('show')),true);
  assert.deepEqual(errors,[]);assert.deepEqual(failed.filter(item=>!item.includes('fonts.gstatic.com')&&!item.includes('fonts.googleapis.com')),[]);
  console.log(JSON.stringify({ok:true,errors,failed},null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exitCode=1});
