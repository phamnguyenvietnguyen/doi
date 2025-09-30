// 1. Three.js hero 3D – nhẹ, 60 fps
import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('canvas3d'),alpha:true});
renderer.setSize(innerWidth,innerHeight);
const geo=new THREE.IcosahedronGeometry(1,0);
const mat=new THREE.MeshStandardMaterial({color:0xff5c5c,flatShading:true});
const mesh=new THREE.Mesh(geo,mat);
scene.add(mesh);
const light=new THREE.DirectionalLight(0xffffff,1);light.position.set(2,2,2);scene.add(light);
cam.position.z=3;
function animate(){requestAnimationFrame(animate);mesh.rotation.y+=0.005;renderer.render(scene,cam);}
animate();
addEventListener('resize',()=>{
  cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});

// 2. Chatbot AI đơn giản (localStorage + rule-based)
class ChatBot extends HTMLElement{
  constructor(){
    super();
    this.attachShadow({mode:'open'});
    this.shadowRoot.innerHTML=`
      <style>
        :host{position:fixed;bottom:20px;right:20px;z-index:999;}
        #box{width:300px;height:400px;background:#222;border:1px solid #444;display:none;flex-direction:column;}
        #head{padding:.5rem;background:#ff5c5c;color:#fff;font-weight:600;cursor:pointer;}
        #log{flex:1;padding:.5rem;overflow:auto;font-size:.9rem;}
        #inp{display:flex;}
        #inp input{flex:1;padding:.5rem;border:none;background:#333;color:#fff;}
      </style>
      <button id="toggle">💬</button>
      <div id="box">
        <div id="head">Chat với mình</div>
        <div id="log"></div>
        <div id="inp"><input placeholder="Nhập tin nhắn..."></div>
      </div>
    `;
    const log=this.shadowRoot.getElementById('log');
    const input=this.shadowRoot.querySelector('input');
    const box=this.shadowRoot.getElementById('box');
    this.shadowRoot.getElementById('toggle').onclick=()=>{
      box.style.display=box.style.display==='flex'?'none':'flex';
    };
    input.addEventListener('keydown',e=>{
      if(e.key!=='Enter')return;
      const q=e.target.value.trim();if(!q)return;
      this.addMsg('Bạn',q);
      this.reply(q.toLowerCase());
      e.target.value='';
    });
    // Load history
    try{JSON.parse(localStorage.chat||'[]').forEach(m=>this.addMsg(m.who,m.text))}catch{}
  }
  addMsg(who,text){
    const div=document.createElement('div');div.textContent=`${who}: ${text}`;
    this.shadowRoot.getElementById('log').appendChild(div);
    this.save();
  }
  reply(q){
    let ans='Mình chưa hiểu, bạn gửi email nhé!';
    if(q.includes('cv')||q.includes('resume'))ans='CV mình đây: https://bit.ly/cv-yourname';
    if(q.includes('dự án')||q.includes('project'))ans='Bạn xem mục "Dự án" bên dưới nhé!';
    if(q.includes('chào'))ans='Chào bạn, mình là A 👋';
    setTimeout(()=>{this.addMsg('Bot',ans)},400);
  }
  save(){
    const msgs=Array.from(this.shadowRoot.querySelectorAll('#log div')).map(d=>{
      const [who,text]=d.textContent.split(': ');return{who,text};
    });
    localStorage.chat=JSON.stringify(msgs);
  }
}
customElements.define('chat-bot',ChatBot);

// 3. Personalization nhẹ: ghi nhận chapter đã xem
const chapters=['hero','about','work','contact'];
const viewed=JSON.parse(localStorage.viewed||'[]');
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting&&!viewed.includes(e.target.id)){
    viewed.push(e.target.id);localStorage.viewed=JSON.stringify(viewed);
    // Gợi ý nội dung trong chatbot
    if(e.target.id==='work')document.querySelector('chat-bot').addMsg('Bot','Bạn đang xem dự án, cần link GitHub không?');
  }
}));
chapters.forEach(id=>io.observe(document.getElementById(id)));

// 4. Helper scroll
window.scrollToChapter=id=>document.getElementById(id).scrollIntoView({behavior:'smooth'});