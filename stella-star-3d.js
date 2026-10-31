/* Solid four-point star, tubular orbit and satellites. No rotating image planes. */
(() => {
  'use strict';
  function buildGeometry() {
    const vertices = [];
    const sub = (a,b) => a.map((v,i) => v-b[i]);
    const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const unit = a => {const length=Math.hypot(...a)||1;return a.map(v=>v/length);};
    function surface(fn, nu, nv, color, metal) {
      const sample = (u,v) => {
        const p=fn(u,v),epsilon=0.0001;
        const du=sub(fn(u+epsilon,v),fn(u-epsilon,v));
        const dv=sub(fn(u,v+epsilon),fn(u,v-epsilon));
        return [...p,...unit(cross(du,dv)),...color,metal];
      };
      for(let i=0;i<nu;i++)for(let j=0;j<nv;j++) {
        const a=sample(i/nu,j/nv), b=sample((i+1)/nu,j/nv);
        const c=sample((i+1)/nu,(j+1)/nv), d=sample(i/nu,(j+1)/nv);
        vertices.push(...a,...b,...c,...a,...c,...d);
      }
    }
    // The rounded solid has a 0.68-unit front-to-back depth, versus 2 units tall.
    surface((u,v) => {
      const theta=u*Math.PI*2,phi=v*Math.PI;
      const r=Math.pow(Math.pow(Math.abs(Math.cos(theta)),0.76)+Math.pow(Math.abs(Math.sin(theta)),0.76),-1/0.76);
      return [r*Math.sin(phi)*Math.cos(theta),1.08*r*Math.sin(phi)*Math.sin(theta),0.34*Math.cos(phi)];
    },64,24,[0.79,0.86,0.99],0.88);
    const orbit = p => {
      const rx=1.03,rz=-0.36;
      const y=p[1]*Math.cos(rx)-p[2]*Math.sin(rx),z=p[1]*Math.sin(rx)+p[2]*Math.cos(rx);
      return [p[0]*Math.cos(rz)-y*Math.sin(rz),p[0]*Math.sin(rz)+y*Math.cos(rz),z];
    };
    surface((u,v) => {
      const a=u*Math.PI*2,b=v*Math.PI*2,r=1.13+0.045*Math.cos(b);
      return orbit([r*Math.cos(a),r*Math.sin(a),0.045*Math.sin(b)]);
    },64,12,[1,0.78,0.32],0.85);
    const satellites=[[-0.94,0.64,0.25,0.105,[1,0.77,0.03]], [0.88,0.70,-0.12,0.075,[0.025,0.16,1]], [0.96,-0.65,0.10,0.08,[1,0.28,0.08]]];
    for(const [x,y,z,r,color] of satellites)surface((u,v)=>{
      const a=u*Math.PI*2,b=v*Math.PI;
      return [x+r*Math.cos(a)*Math.sin(b),y+r*Math.sin(a)*Math.sin(b),z+r*Math.cos(b)];
    },16,12,color,0.25);
    return new Float32Array(vertices);
  }
  if(typeof module !== 'undefined' && module.exports) module.exports={buildGeometry};
  if(typeof document === 'undefined') return;
  const holder=document.querySelector('.stella-emblem');
  const canvas=holder?.querySelector('canvas');
  if(!canvas) return;
  let gl;
  try {gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});} catch {return;}
  if(!gl) return;
  const vertexSource=`
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;
    attribute float aMetal;
    uniform mat3 uRotation;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying float vMetal;
    void main(){
      vec3 p=uRotation*aPosition;
      vPosition=p;vNormal=uRotation*aNormal;vColor=aColor;vMetal=aMetal;
      float distance=4.1-p.z;
      gl_Position=vec4(p.x*2.65,p.y*2.65,1.01005*distance-0.201005,distance);
    }`;
  const fragmentSource=`
    precision mediump float;
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying float vMetal;
    void main(){
      vec3 n=normalize(vNormal);
      vec3 view=normalize(vec3(0.0,0.0,4.1)-vPosition);
      if(dot(n,view)<0.0)n=-n;
      vec3 reflection=reflect(-view,n);
      float sky=smoothstep(-0.45,0.6,reflection.y);
      vec3 env=mix(vec3(0.21,0.32,0.53),vec3(0.84,0.93,1.0),sky);
      float warm=pow(max(0.0,dot(reflection,normalize(vec3(0.8,-0.25,0.5)))),8.0);
      env=mix(env,vec3(1.0,0.64,0.22),warm*0.8);
      float softbox=pow(max(0.0,dot(reflection,normalize(vec3(-0.6,0.85,0.8)))),20.0);
      float strip=pow(max(0.0,1.0-abs(reflection.x*0.65+reflection.z*0.28-0.38)),35.0);
      float rim=pow(1.0-max(dot(n,view),0.0),3.0);
      float diffuse=0.38+0.62*max(dot(n,normalize(vec3(-0.5,0.8,1.0))),0.0);
      vec3 color=mix(vColor*diffuse,env*mix(vec3(1.0),vColor,0.38),vMetal);
      color+=vec3(1.0,0.98,0.91)*(softbox*0.9+strip*0.65+rim*0.22);
      color=pow(clamp(color,0.0,1.0),vec3(0.85));
      gl_FragColor=vec4(color,1.0);
    }`;
  function compile(type,source) {
    const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Star shader compilation failed');}
    return shader;
  }
  try {
    const program=gl.createProgram();
    const vertex=compile(gl.VERTEX_SHADER,vertexSource),fragment=compile(gl.FRAGMENT_SHADER,fragmentSource);
    gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Star program link failed');
    gl.deleteShader(vertex);gl.deleteShader(fragment);gl.useProgram(program);
    const geometry=buildGeometry(),buffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,geometry,gl.STATIC_DRAW);
    for(const [name,size,offset] of [['aPosition',3,0],['aNormal',3,3],['aColor',3,6],['aMetal',1,9]]){
      const location=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location,size,gl.FLOAT,false,40,offset*4);
    }
    const rotation=gl.getUniformLocation(program,'uRotation');
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    let last=0,painted=0,angle=0.35,frame=0;
    gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
    function draw(time=0){
      frame=0;
      if(last&&!motion.matches)angle+=Math.min(time-last,50)*Math.PI*2/24000;
      last=time;
      if(painted&&time-painted<32&&!motion.matches){frame=requestAnimationFrame(draw);return;}
      painted=time;
      const size=Math.max(1,Math.round(canvas.clientWidth*Math.min(devicePixelRatio||1,2)));
      if(canvas.width!==size||canvas.height!==size){canvas.width=size;canvas.height=size;gl.viewport(0,0,size,size);}
      const c=Math.cos(angle),s=Math.sin(angle),pitch=0.12,cp=Math.cos(pitch),sp=Math.sin(pitch);
      // Column-major Rx(pitch) * Ry(angle): the geometry turns, the canvas does not.
      gl.uniformMatrix3fv(rotation,false,new Float32Array([c,sp*s,-cp*s,0,cp,sp,s,-sp*c,cp*c]));
      gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES,0,geometry.length/10);
      holder.classList.add('is-rendered');
      if(!motion.matches&&!document.hidden)frame=requestAnimationFrame(draw);
    }
    function resume(){cancelAnimationFrame(frame);last=0;painted=0;if(!document.hidden)draw();}
    document.addEventListener('visibilitychange',resume);
    motion.addEventListener('change',resume);
    new ResizeObserver(()=>{if(motion.matches||!frame)resume();}).observe(canvas);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);holder.classList.remove('is-rendered');});
    draw();
  } catch(error){holder.classList.remove('is-rendered');console.warn('3D emblem unavailable; using static emblem.',error);}
})();
