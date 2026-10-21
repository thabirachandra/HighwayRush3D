(() => {
'use strict';
const $ = id => document.getElementById(id);
const colors = ['#ff6938','#35d9ff','#bd75ff','#f5d34f'];
const cars = [{name:'APEX GT',color:colors[0]},{name:'VOLT XR',color:colors[1]},{name:'PHANTOM',color:colors[2]},{name:'SOLAR R',color:colors[3]}];
let selected=0,scene,camera,renderer,player,roadLines=[],traffic=[],pickups=[],buildings=[],clock;
let running=false,paused=false,ended=false,speed=0,distance=0,coins=0,nitro=100,score=0,best=+(localStorage.getItem('hr3d_best')||0),bank=+(localStorage.getItem('hr3d_coins')||0);
const keys={left:false,right:false,gas:false,brake:false,nitro:false};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function material(color,roughness=.5,metalness=.1){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
function addBox(parent,w,h,d,color,x,y,z,opts={}){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color,opts.roughness??.5,opts.metalness??.1));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function makeCar(color){
 const g=new THREE.Group();
 addBox(g,1.45,.38,2.8,color,0,.48,0,{metalness:.55,roughness:.25});
 addBox(g,1.13,.48,1.25,'#101b2b',0,.86,-.22,{metalness:.5,roughness:.25});
 addBox(g,1.08,.09,.5,'#9beeff',0,.98,.47,{metalness:.4,roughness:.18});
 addBox(g,1.1,.08,.35,'#ffdb9b',0,.69,1.35);
 addBox(g,1.1,.08,.25,'#ff382d',0,.68,-1.43);
 for(const x of [-.78,.78])for(const z of [-.91,.92]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.18,16),material('#11151c',.9,0));
  wheel.rotation.z=Math.PI/2;wheel.position.set(x,.3,z);wheel.castShadow=true;g.add(wheel);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.19,12),material('#8da2b8',.3,.7));hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);g.add(hub);
 }
 const glow=new THREE.PointLight(color,1.2,5);glow.position.set(0,.6,-1.5);g.add(glow);
 return g;
}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color('#91b6ce');scene.fog=new THREE.Fog('#91b6ce',30,135);
 camera=new THREE.PerspectiveCamera(63,innerWidth/innerHeight,.1,250);camera.position.set(0,5.4,9);
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.body.prepend(renderer.domElement);
 scene.add(new THREE.HemisphereLight('#e9f7ff','#253347',2));
 const sun=new THREE.DirectionalLight('#fff0d5',2.2);sun.position.set(-7,15,8);sun.castShadow=true;scene.add(sun);
 addBox(scene,200,.2,250,'#43895c',0,-.25,-75);
 addBox(scene,11,.18,240,'#262d39',0,-.08,-70);
 addBox(scene,.18,.02,240,'#dce7e8',-5.4,.03,-70);addBox(scene,.18,.02,240,'#dce7e8',5.4,.03,-70);
 for(let lane=-1;lane<=1;lane++){for(let i=0;i<18;i++){const line=addBox(scene,.11,.025,3.2,'#eaf4f0',lane*2.8,.04,-i*9-2);roadLines.push(line);}}
 for(let side of [-1,1])for(let i=0;i<34;i++){
  const h=2+Math.random()*10,w=1.8+Math.random()*3,z=-i*8-Math.random()*6,x=side*(8+Math.random()*9);
  const b=addBox(scene,w,h,2+Math.random()*3,['#536c80','#6c7784','#a2a9ad','#45576c'][i%4],x,h/2-.1,z);
  b.userData={baseZ:z,side};buildings.push(b);
  for(let yy=1;yy<h-.5;yy+=1.5)for(let xx=-w/2+.4;xx<w/2-.2;xx+=.8){const win=addBox(scene,.18,.28,.035,'#e8d9a0',x+xx,yy,z+1.03);win.userData={decor:true};}
 }
 player=makeCar(cars[selected].color);player.position.set(0,0,3);scene.add(player);
 for(let i=0;i<7;i++)spawnTraffic(-22-i*22);
 for(let i=0;i<8;i++)spawnCoin(-18-i*16);
 clock=new THREE.Clock();
 addEvents();animate();
 setTimeout(()=>$('loading').style.display='none',650);
 updateGarage();
}
function spawnTraffic(z){const palette=['#f1f4f7','#e44c3b','#2d8dc5','#f0bc45','#343e52'];const c=makeCar(palette[Math.floor(Math.random()*palette.length)]);c.scale.set(.92,.92,.92);c.position.set([-2.8,0,2.8][Math.floor(Math.random()*3)],0,z);c.userData={speed:12+Math.random()*18};scene.add(c);traffic.push(c);}
function spawnCoin(z){const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.12,8,18),material('#ffd447',.25,.75));ring.rotation.y=Math.PI/2;g.add(ring);const light=new THREE.PointLight('#ffcb36',.6,2);g.add(light);g.position.set([-2.8,0,2.8][Math.floor(Math.random()*3)],1.1,z);scene.add(g);pickups.push(g);}
function updateGarage(){ $('carName').textContent=cars[selected].name;$('carArt').style.color=cars[selected].color;$('carArt').textContent='◆';$('carDots').innerHTML=cars.map((c,i)=>`<span class="dot" style="background:${c.color};opacity:${i===selected?1:.35}"></span>`).join('');$('menuBest').textContent=best+' m';$('menuCoins').textContent=bank;}
function resetRace(){for(const t of traffic)scene.remove(t);for(const p of pickups)scene.remove(p);traffic=[];pickups=[];speed=0;distance=0;coins=0;nitro=100;score=0;player.position.set(0,0,3);player.rotation.set(0,0,0);for(let i=0;i<7;i++)spawnTraffic(-22-i*22);for(let i=0;i<8;i++)spawnCoin(-18-i*16);$('distance').textContent='0';$('coins').textContent='0';$('best').textContent=best+' m';$('nitroBar').style.width='100%';$('nitroText').textContent='100%';}
function start(){resetRace();$('menu').hidden=true;$('overPanel').hidden=true;$('pausePanel').hidden=true;$('hud').hidden=false;$('controls').hidden=false;running=true;paused=false;ended=false;}
function pause(){if(!running||ended)return;paused=!paused;$('pausePanel').hidden=!paused;}
function finish(){running=false;ended=true;$('controls').hidden=true;$('overPanel').hidden=false;$('finalDistance').textContent=Math.floor(distance)+' m';$('finalCoins').textContent=coins;bank+=coins;localStorage.setItem('hr3d_coins',bank);if(distance>best){best=Math.floor(distance);localStorage.setItem('hr3d_best',best);}updateGarage();}
function toGarage(){$('menu').hidden=false;$('hud').hidden=true;$('controls').hidden=true;$('overPanel').hidden=true;$('pausePanel').hidden=true;running=false;paused=false;updateGarage();}
function addEvents(){
 $('startBtn').onclick=start;$('retryBtn').onclick=start;$('pauseBtn').onclick=pause;$('resumeBtn').onclick=pause;$('quitBtn').onclick=toGarage;$('garageBtn').onclick=toGarage;
 $('prevCar').onclick=()=>{selected=(selected+cars.length-1)%cars.length;updateGarage();};$('nextCar').onclick=()=>{selected=(selected+1)%cars.length;updateGarage();};
 addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=true;if(k==='arrowright'||k==='d')keys.right=true;if(k==='arrowup'||k==='w')keys.gas=true;if(k==='arrowdown'||k==='s')keys.brake=true;if(k===' '||k==='shift')keys.nitro=true;if(k==='p'||k==='escape')pause();});
 addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='arrowleft'||k==='a')keys.left=false;if(k==='arrowright'||k==='d')keys.right=false;if(k==='arrowup'||k==='w')keys.gas=false;if(k==='arrowdown'||k==='s')keys.brake=false;if(k===' '||k==='shift')keys.nitro=false;});
 document.querySelectorAll('[data-key]').forEach(btn=>{const k=btn.dataset.key;const on=e=>{e.preventDefault();keys[k]=true;};const off=e=>{e.preventDefault();keys[k]=false;};btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointercancel',off);btn.addEventListener('pointerleave',off);});
 addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);if(running&&!paused&&!ended)update(dt);renderer.render(scene,camera);}
function update(dt){
 const boost=keys.nitro&&nitro>0;const max=boost?205:155;
 if(keys.gas||(!keys.brake&&speed<65))speed+=58*dt;else speed-=keys.brake?115*dt:22*dt;
 if(boost){speed+=85*dt;nitro=Math.max(0,nitro-29*dt);}else nitro=Math.min(100,nitro+8*dt);
 speed=clamp(speed,0,max);const v=speed/155;
 player.position.x=clamp(player.position.x+((keys.right?1:0)-(keys.left?1:0))*dt*(3.4+v*3),-4.25,4.25);
 player.rotation.z=THREE.MathUtils.damp(player.rotation.z,((keys.left?1:0)-(keys.right?1:0))*.13,5,dt);
 player.rotation.y=THREE.MathUtils.damp(player.rotation.y,((keys.left?1:0)-(keys.right?1:0))*.08,4,dt);
 const move=(9+v*42)*dt;distance+=move*2.1;score+=move;
 for(const l of roadLines){l.position.z+=move;if(l.position.z>8)l.position.z-=162;}
 for(const b of buildings){b.position.z+=move*.8;if(b.position.z>10){b.position.z-=270;b.position.x=b.userData.side*(8+Math.random()*9);}}
 for(const t of traffic){t.position.z+=move*(.75+t.userData.speed/70);if(t.position.z>8){t.position.z=-125-Math.random()*35;t.position.x=[-2.8,0,2.8][Math.floor(Math.random()*3)];}
  if(Math.abs(t.position.z-player.position.z)<1.7&&Math.abs(t.position.x-player.position.x)<1.15){finish();break;}}
 for(const p of pickups){p.position.z+=move;p.rotation.y+=dt*2.5;if(p.position.z>8){p.position.z=-120-Math.random()*35;p.position.x=[-2.8,0,2.8][Math.floor(Math.random()*3)];}
  if(Math.abs(p.position.z-player.position.z)<1.7&&Math.abs(p.position.x-player.position.x)<1.15){coins++;p.position.z=-150-Math.random()*40;$('coins').textContent=coins;}}
 camera.position.x=THREE.MathUtils.damp(camera.position.x,player.position.x*.38,3,dt);camera.position.y=THREE.MathUtils.damp(camera.position.y,5.1+v*.7,2,dt);camera.lookAt(player.position.x*.2,.6,-4);
 $('speed').textContent=Math.round(speed);$('distance').textContent=Math.floor(distance);$('nitroBar').style.width=nitro+'%';$('nitroText').textContent=Math.round(nitro)+'%';
}
try{init();}catch(err){console.error(err);$('loading').innerHTML='<b>Unable to start 3D game</b><small>Refresh and check internet connection.</small>';}
})();
