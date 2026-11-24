// Tetris independente para demonstração visual. O controle de acesso por compra é responsabilidade do backend.
const canvas = document.querySelector('#board');
const ctx = canvas.getContext('2d');
const nextCtx = document.querySelector('#next').getContext('2d');
const BLOCK = 30, COLS = 10, ROWS = 20;
const COLORS = {I:'#41d8f5',O:'#ffd35a',T:'#b65cff',S:'#5ee69d',Z:'#fa637d',J:'#648aff',L:'#ffad5b'};
const SHAPES = {
  I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O:[[1,1],[1,1]], T:[[0,1,0],[1,1,1],[0,0,0]],
  S:[[0,1,1],[1,1,0],[0,0,0]], Z:[[1,1,0],[0,1,1],[0,0,0]],
  J:[[1,0,0],[1,1,1],[0,0,0]], L:[[0,0,1],[1,1,1],[0,0,0]]
};
const TYPES = Object.keys(SHAPES);
const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlay-title');
const overlayText = document.querySelector('#overlay-text');
const overlayButton = document.querySelector('#overlay-button');
const pauseButton = document.querySelector('#pause');
let board, piece, nextPiece, score, lines, level, best = 0, status = 'ready', lastTime = 0, fallTime = 0;
try { best = Number(localStorage.getItem('spacegames-tetris-best')) || 0; } catch (_) {}
function randomPiece(){ const type=TYPES[Math.floor(Math.random()*TYPES.length)];return {type,matrix:SHAPES[type].map(row=>[...row]),x:0,y:0}; }
function reset(){board=Array.from({length:ROWS},()=>Array(COLS).fill(null));score=0;lines=0;level=1;piece=null;nextPiece=randomPiece();fallTime=0;updateStats();draw();}
function updateStats(){document.querySelector('#score').textContent=score;document.querySelector('#lines').textContent=lines;document.querySelector('#level').textContent=level;document.querySelector('#best').textContent=best;}
function collides(p,dx=0,dy=0,matrix=p.matrix){for(let y=0;y<matrix.length;y++)for(let x=0;x<matrix[y].length;x++){if(!matrix[y][x])continue;const xx=p.x+x+dx,yy=p.y+y+dy;if(xx<0||xx>=COLS||yy>=ROWS||(yy>=0&&board[yy][xx]))return true;}return false;}
function spawn(){piece=nextPiece;nextPiece=randomPiece();piece.x=Math.floor((COLS-piece.matrix.length)/2);piece.y=-1;if(collides(piece)){gameOver();}}
function merge(){piece.matrix.forEach((row,y)=>row.forEach((v,x)=>{if(v&&piece.y+y>=0)board[piece.y+y][piece.x+x]=piece.type;}));}
function clearLines(){let count=0;for(let y=ROWS-1;y>=0;y--){if(board[y].every(Boolean)){board.splice(y,1);board.unshift(Array(COLS).fill(null));count++;y++;}}if(count){lines+=count;score+=[0,100,300,500,800][count]*level;level=Math.floor(lines/10)+1;if(score>best){best=score;try{localStorage.setItem('spacegames-tetris-best',String(best));}catch(_){}}updateStats();}}
function stepDown(){if(status!=='playing')return;if(!collides(piece,0,1)){piece.y++;return;}merge();clearLines();spawn();}
function move(dx){if(status==='playing'&&!collides(piece,dx,0))piece.x+=dx;}
function rotate(){if(status!=='playing')return;const m=piece.matrix;const rotated=m[0].map((_,i)=>m.map(row=>row[i]).reverse());for(const dx of [0,-1,1,-2,2]){if(!collides(piece,dx,0,rotated)){piece.x+=dx;piece.matrix=rotated;break;}}}
function drop(){if(status!=='playing')return;let distance=0;while(!collides(piece,0,1)){piece.y++;distance++;}score+=distance*2;updateStats();stepDown();}
function paintBlock(c,x,y,size,color){c.fillStyle=color;c.fillRect(x*size+1,y*size+1,size-2,size-2);c.fillStyle='#ffffff33';c.fillRect(x*size+2,y*size+2,size-4,3);}
function draw(){ctx.fillStyle='#0b0b17';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#252239';ctx.lineWidth=.5;for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*BLOCK,0);ctx.lineTo(x*BLOCK,600);ctx.stroke();}for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*BLOCK);ctx.lineTo(300,y*BLOCK);ctx.stroke();}board.forEach((row,y)=>row.forEach((type,x)=>{if(type)paintBlock(ctx,x,y,BLOCK,COLORS[type]);}));if(piece)piece.matrix.forEach((row,y)=>row.forEach((v,x)=>{if(v&&piece.y+y>=0)paintBlock(ctx,piece.x+x,piece.y+y,BLOCK,COLORS[piece.type]);}));nextCtx.fillStyle='#121120';nextCtx.fillRect(0,0,120,120);if(nextPiece){const m=nextPiece.matrix,s=24,ox=(120-m.length*s)/2,oy=(120-m.length*s)/2;m.forEach((row,y)=>row.forEach((v,x)=>{if(v){nextCtx.fillStyle=COLORS[nextPiece.type];nextCtx.fillRect(ox+x*s+1,oy+y*s+1,s-2,s-2);}}));}}
function showOverlay(title,description,button){overlayTitle.textContent=title;overlayText.textContent=description;overlayButton.textContent=button;overlay.hidden=false;}
function gameOver(){status='over';pauseButton.disabled=true;showOverlay('FIM DE JOGO',`Você fez ${score} pontos!`,'↻ Jogar novamente');}
function start(){reset();status='playing';spawn();overlay.hidden=true;pauseButton.disabled=false;pauseButton.textContent='⏸ Pausar';lastTime=performance.now();}
function togglePause(){if(status==='playing'){status='paused';showOverlay('JOGO PAUSADO','Seu jogo está esperando.','▶ Continuar');pauseButton.textContent='▶ Continuar';}else if(status==='paused'){status='playing';overlay.hidden=true;pauseButton.textContent='⏸ Pausar';lastTime=performance.now();}}
overlayButton.addEventListener('click',()=>status==='paused'?togglePause():start());
document.querySelector('#restart').addEventListener('click',start);
pauseButton.addEventListener('click',togglePause);
function action(name){if(name==='left')move(-1);if(name==='right')move(1);if(name==='rotate')rotate();if(name==='down'){stepDown();}if(name==='drop')drop();draw();}
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>action(b.dataset.action)));
document.addEventListener('keydown',event=>{const keys={'ArrowLeft':'left','ArrowRight':'right','ArrowUp':'rotate','ArrowDown':'down',' ':'drop'};if(keys[event.key]){event.preventDefault();if(!event.repeat||keys[event.key]!=='drop')action(keys[event.key]);}if(event.key.toLowerCase()==='p'&&!event.repeat)togglePause();});
function loop(time){const dt=Math.min(time-lastTime,100);lastTime=time;if(status==='playing'){fallTime+=dt;if(fallTime>=Math.max(110,850-(level-1)*65)){stepDown();fallTime=0;}}draw();requestAnimationFrame(loop);}
reset();requestAnimationFrame(loop);
