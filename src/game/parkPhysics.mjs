// 배경 원본(1568 × 1003) 좌표로 작성합니다. 화면 크기에 맞춰 함께 축소됩니다.
// 작은 돌·풀·덤불은 밟고 지나가는 장식이므로 장애물에 포함하지 않습니다.
export const PARK_OBSTACLES = [
  {id:'tree-left-1', points:[[35,110],[55,48],[100,30],[146,55],[164,130],[133,168],[120,207],[82,207],[77,169],[42,148]]},
  {id:'tree-left-2', points:[[141,108],[163,50],[207,28],[248,52],[271,110],[258,150],[222,171],[223,202],[188,202],[183,168],[150,147]]},
  {id:'bench', points:[[333,77],[459,57],[474,111],[469,137],[358,156],[337,140]]},
  {id:'tree-right-1', points:[[1263,106],[1283,54],[1326,33],[1367,56],[1390,113],[1371,157],[1346,172],[1347,202],[1312,202],[1308,170],[1276,150]]},
  {id:'tree-right-2', points:[[1386,109],[1410,54],[1454,35],[1497,63],[1518,121],[1500,159],[1469,180],[1471,216],[1436,216],[1433,177],[1399,153]]},
  {id:'pond', points:[[1240,816],[1294,786],[1373,767],[1441,771],[1495,795],[1514,833],[1504,874],[1469,911],[1410,928],[1357,920],[1318,905],[1270,893],[1242,874],[1234,846]]},
];

export function createParkWorld(width, height, dogSize) {
  return {width,height,dogSize,polygons:PARK_OBSTACLES.map(obstacle=>obstacle.points.map(([x,y])=>[x/1568*width,y/1003*height]))};
}

// 머리까지 포함한 큰 사각형 대신 발이 닿는 작은 타원만 검사합니다.
// 머리와 꼬리가 물체 옆으로 보이는 것과 실제로 그 위에 올라서는 것을 구분합니다.
export function isParkPositionFree(position, world) {
  const {width,height,dogSize:s,polygons}=world;
  if(position.x<0||position.y<0||position.x>Math.max(0,width-s)||position.y>Math.max(0,height-s))return false;
  const cx=position.x+s*.5,cy=position.y+s*.85;
  const rx=s*.18,ry=s*.075;
  return !polygons.some(polygon=>{
    // 타원을 단위원으로 바꿔 윤곽선까지의 거리를 검사합니다.
    // 오목한 나무줄기 주변도 빈 공간 그대로 통과할 수 있습니다.
    const points=polygon.map(([x,y])=>[(x-cx)/rx,(y-cy)/ry]);
    let inside=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++){
      const [ax,ay]=points[j],[bx,by]=points[i];
      if((ay>0)!==(by>0)&&0<(bx-ax)*(-ay)/(by-ay)+ax)inside=!inside;
      const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
      const t=length?Math.max(0,Math.min(1,-(ax*dx+ay*dy)/length)):0;
      if((ax+t*dx)**2+(ay+t*dy)**2<1)return true;
    }
    return inside;
  });
}

export function safeParkPosition(position, world) {
  const bound=p=>({x:Math.max(0,Math.min(Number.isFinite(p.x)?p.x:24,Math.max(0,world.width-world.dogSize))),y:Math.max(0,Math.min(Number.isFinite(p.y)?p.y:150,Math.max(0,world.height-world.dogSize)))});
  const start=bound(position);
  if(isParkPositionFree(start,world))return start;
  // 예전에 저장한 물 위 좌표나 화면 회전으로 생긴 겹침을 가까운 빈자리로 복구합니다.
  let nearest=null,distance=Infinity;
  for(let y=0;y<=world.height-world.dogSize;y+=3)for(let x=0;x<=world.width-world.dogSize;x+=3){
    const d=(x-start.x)**2+(y-start.y)**2;
    if(d<distance&&isParkPositionFree({x,y},world)){nearest={x,y};distance=d;}
  }
  return nearest||start;
}

export function moveInPark(position, dx, dy, world) {
  const next={x:position.x,y:position.y};
  // 큰 이동도 2px 이하로 나눠 얇은 장애물을 통과하지 않게 합니다.
  const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/2));
  for(let i=0;i<steps;i++){
    const x=Math.max(0,Math.min(next.x+dx/steps,world.width-world.dogSize));
    if(isParkPositionFree({...next,x},world))next.x=x;
    const y=Math.max(0,Math.min(next.y+dy/steps,world.height-world.dogSize));
    if(isParkPositionFree({...next,y},world))next.y=y;
  }
  // 축을 따로 검사하므로 대각선 입력은 장애물 가장자리를 따라 미끄러집니다.
  return next;
}
