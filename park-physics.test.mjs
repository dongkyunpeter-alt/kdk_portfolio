import assert from 'node:assert/strict';
import {createParkWorld,isParkPositionFree,moveInPark,safeParkPosition,PARK_OBSTACLES} from './src/game/parkPhysics.mjs';

// 몸통 사각형은 겹치지만 발은 아직 닿지 않은 위치는 지나갈 수 있어야 합니다.
const closeWorld={width:400,height:300,dogSize:82,polygons:[[[100,100],[250,100],[250,180],[100,180]]]};
assert.ok(isParkPositionFree({x:150,y:24},closeWorld),'Approach within one pixel of the visible edge');
assert.equal(isParkPositionFree({x:150,y:28},closeWorld),false,'Feet entering the object still stop');
const concaveWorld={width:400,height:300,dogSize:20,polygons:[[[100,60],[200,60],[200,100],[160,100],[160,160],[140,160],[140,100],[100,100]]]};
assert.ok(isParkPositionFree({x:170,y:110},concaveWorld),'Empty space next to a narrow trunk remains open');
assert.equal(isParkPositionFree({x:140,y:110},concaveWorld),false,'Trunk itself remains solid');

for(const [width,size] of [[523,82],[280,56],[240,56]]){
  const world=createParkWorld(width,width*1003/1568,size);
  // 연못 왼쪽 돌과 풀 사이에서 발생했던 투명벽의 회귀 검사입니다.
  for(const [x,y] of [[1080,800],[1140,810],[1170,813]]){
    const position={x:x/1568*world.width-size*.5,y:y/1003*world.height-size*.85};
    assert.ok(isParkPositionFree(position,world),`Pond-left decorations are walkable at ${width}: ${x},${y}`);
  }
  assert.ok(PARK_OBSTACLES.every(({id})=>id.startsWith('tree-')||id==='bench'||id==='pond'));
  for(const obstacle of PARK_OBSTACLES){
    const cx=obstacle.points.reduce((s,p)=>s+p[0],0)/obstacle.points.length/1568*width;
    const cy=obstacle.points.reduce((s,p)=>s+p[1],0)/obstacle.points.length/1003*world.height;
    const inside={x:cx-size*.5,y:cy-size*.85};
    assert.equal(isParkPositionFree(inside,world),false,obstacle.id);
    assert.ok(isParkPositionFree(safeParkPosition(inside,world),world),`recover ${obstacle.id}`);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1]]){
      let p=safeParkPosition({x:inside.x-dx*100,y:inside.y-dy*100},world);
      for(let i=0;i<35;i++){
        p=moveInPark(p,dx*32,dy*32,world);
        assert.ok(isParkPositionFree(p,world),`${obstacle.id}: movement must stay outside`);
      }
    }
  }
  // 각 뼈에 닿을 수 있는 안전한 위치가 시작점과 연결되어 있는지 탐색합니다.
  const step=4,queue=[safeParkPosition({x:24,y:150},world)],seen=new Set(),reached=new Set();
  for(let index=0;index<queue.length;index++){
    const p=queue[index];
    [[18,23],[52,78],[81,39]].forEach(([x,y],i)=>{
      if(p.x<x/100*width+21&&p.x+size>x/100*width-21&&p.y<y/100*world.height+21&&p.y+size>y/100*world.height-21)reached.add(i);
    });
    for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
      const n={x:p.x+dx,y:p.y+dy},key=`${n.x},${n.y}`;
      if(!seen.has(key)&&isParkPositionFree(n,world)){seen.add(key);queue.push(n);}
    }
  }
  assert.equal(reached.size,3,`All bones reachable at width ${width}`);
}
// 긴 한 번의 이동도 벤치를 관통하면 안 됩니다.
const world=createParkWorld(1568,1003,82);
const start=safeParkPosition({x:350,y:210},world);
const stopped=moveInPark(start,0,-1000,world);
assert.ok(stopped.y>60,'Bench blocks a large upward step');
const sliding=moveInPark(stopped,40,-40,world);
assert.ok(sliding.x>stopped.x+20,'Diagonal input slides along the bench');
console.log('PASS: all obstacles, saved-position recovery, movement, bone reachability at 3 sizes, tunneling, sliding');
