const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
  const {createParkWorld,isParkPositionFree}=await import('./src/game/parkPhysics.mjs');
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://127.0.0.1:4392/index.html');
    await page.waitForTimeout(2600);
    for(const width of [1440,390]){
      await page.setViewportSize({width,height:900});
      const dims=await page.locator('#game-arena').evaluate(a=>({width:a.clientWidth,height:a.clientHeight,size:document.querySelector('#mungi').offsetWidth}));
      const world=createParkWorld(dims.width,dims.height,dims.size);
      for(const input of ['keyboard','pad','step']){
        // 연못 바로 위의 잔디에서 아래로 충분히 오래 이동합니다.
        await page.evaluate(({width,height,size})=>localStorage.setItem('kdk-project-bones-v2',JSON.stringify({collected:[0,2],unlockedProjects:[],x:width*.88-size*.5,y:height*.6-size*.94})),dims);
        await page.reload();await page.waitForTimeout(2600);
        const position=()=>page.locator('#mungi').evaluate(d=>({x:parseFloat(d.style.left),y:parseFloat(d.style.top)}));
        const before=await position();
        if(input==='keyboard'){await page.keyboard.down('s');await page.waitForTimeout(900);await page.keyboard.up('s');}
        else if(input==='pad'){
          await page.locator('[data-move="down"]').scrollIntoViewIfNeeded();
          const box=await page.locator('[data-move="down"]').boundingBox();
          await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForTimeout(900);await page.mouse.up();
        }else for(let i=0;i<12;i++)await page.locator('[data-move="down"]').press('Enter');
        const after=await position();
        assert.ok(after.y>before.y+5,`${input}: actually moved`);
        assert.ok(after.y<dims.height-dims.size-10,`${input}: stopped before pond instead of map edge`);
        assert.ok(isParkPositionFree(after,world),`${input}: outside pond at ${width}`);
      }
      // 과거에 연못 위에 저장된 상태도 로딩 시 복구합니다.
      await page.evaluate(({width,height,size})=>localStorage.setItem('kdk-project-bones-v2',JSON.stringify({collected:[0,2],unlockedProjects:[],x:width*.88-size*.5,y:height*.85-size*.5})),dims);
      await page.reload();await page.waitForTimeout(600);
      const recovered=await page.locator('#mungi').evaluate(d=>({x:parseFloat(d.style.left),y:parseFloat(d.style.top)}));
      assert.ok(isParkPositionFree(recovered,world),'Saved pond position recovered');
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: desktop/mobile pond collision via WASD, held pad, Enter steps; saved position recovery; no JS errors');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
