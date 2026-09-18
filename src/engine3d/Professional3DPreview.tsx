import React,{useEffect,useRef}from'react';
import {runCinematicPreview} from './ProceduralCinematicEngine';

export function Professional3DPreview({character,large=false}:{character:any;large?:boolean}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!ref.current)return;return runCinematicPreview(ref.current,character);},[character]);
 return <div ref={ref} className={large?'sceneCanvas professionalViewport':'sceneCanvas professionalCharacter'}/>;
}
