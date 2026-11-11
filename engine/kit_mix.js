/* Mix kit: each chapter's stage is built by the scene kit that owns it.
   Each kit gets its own region of the map so grounds never overlap. W.stages[i].kit names the kit. */
(function(){
"use strict";
const E=ENG;E.kits=E.kits||{};
const REGION={ancient_town:0,school_campus:1,world:2};
E.kits.mix={_kits:[],_stageKit:[],
  region(k){return new THREE.Vector3((REGION[k]||0)*700,0,0);},
  build(W,stagePos){const groups={};W.stages.forEach((s,i)=>{(groups[s.kit]=groups[s.kit]||[]).push(i);});
    Object.keys(groups).forEach(k=>{const K=E.kits[k];if(!K){console.warn('missing kit',k);return;}const idx=groups[k],off=this.region(k);const before=new Set(E.scene.children);
      const subW=Object.assign({},W,{scene_kit:k,stages:idx.map(i=>W.stages[i])});K.build(subW,idx.map(i=>stagePos[i].clone().sub(off)));
      E.scene.children.filter(o=>!before.has(o)).forEach(o=>o.position.add(off));if(!this._kits.includes(K))this._kits.push(K);idx.forEach(i=>this._stageKit[i]=K);});},
  prop(type,i){const K=this._stageKit[i]||this._kits[0];return K.prop(type);},
  onFrame(dt,t){this._kits.forEach(K=>{if(K.onFrame)K.onFrame(dt,t);});}};
})();
