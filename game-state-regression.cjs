const {chromium}=require('playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:4392/index.html');
    await page.waitForTimeout(2600);
    const dog=page.locator('#mungi');
    const reset=()=>page.locator('#game-reset').click();
    const x=()=>dog.evaluate(n=>parseFloat(n.style.left));
    const motion=()=>dog.getAttribute('data-motion');
    await reset();
    await page.keyboard.down('d');await page.waitForTimeout(120);await page.keyboard.up('d');
    await page.waitForTimeout(3000);
    await page.keyboard.down('d');await page.waitForTimeout(120);await page.keyboard.up('d');
    await page.waitForTimeout(1400);
    assert.equal(await motion(),'sit','Old sleep timer must not override the latest idle cycle');
    await page.waitForTimeout(3100);assert.equal(await motion(),'sleep');

    // Completing while the animation loop is active must not block a restart.
    await reset();await page.keyboard.down('d');await page.waitForTimeout(100);
    await page.locator('#quick-unlock').click();await page.keyboard.up('d');await reset();
    let before=await x();await page.keyboard.down('d');await page.waitForTimeout(180);await page.keyboard.up('d');
    assert.ok(await x()>before+20,'Movement restarts after completion');

    // Releasing one of two equivalent keys must keep the other key active.
    await reset();await page.keyboard.down('d');await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(80);await page.keyboard.up('d');before=await x();
    await page.waitForTimeout(120);assert.ok(await x()>before+15);await page.keyboard.up('ArrowRight');

    await reset();
    const box=await page.locator('[data-move="right"]').boundingBox();
    await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
    before=await x();await page.waitForTimeout(180);assert.ok(await x()>before+20);await page.mouse.up();
    await page.waitForTimeout(1300);assert.equal(await motion(),'sit','Pad release starts the same idle cycle');
    await page.waitForTimeout(3100);assert.equal(await motion(),'sleep');

    await reset();await page.keyboard.down('d');await page.waitForTimeout(80);
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));before=await x();
    await page.waitForTimeout(180);assert.equal(await x(),before,'Blur clears held inputs');await page.keyboard.up('d');
    assert.deepEqual(errors,[]);
    console.log('PASS: idle timers, completion/restart, combined keys, held pad, blur, console errors');
  }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
