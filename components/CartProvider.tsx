'use client';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
export type Item={id:string;name:string;price:number;qty:number;extras:string[]};
const Ctx=createContext<any>(null);
export function CartProvider({children}:{children:React.ReactNode}){
 const [items,setItems]=useState<Item[]>([]); const [ready,setReady]=useState(false);
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem('bite-cart')||'[]'))}catch{} setReady(true)},[]);
 useEffect(()=>{if(ready)localStorage.setItem('bite-cart',JSON.stringify(items))},[items,ready]);
 const add=(item:Omit<Item,'qty'>)=>setItems(x=>{const old=x.find(i=>i.id===item.id);return old?x.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i):[...x,{...item,qty:1}]});
 const update=(id:string,qty:number)=>setItems(x=>qty<1?x.filter(i=>i.id!==id):x.map(i=>i.id===id?{...i,qty}:i));
 const clear=()=>setItems([]); const total=items.reduce((s,i)=>s+i.price*i.qty,0); const count=items.reduce((s,i)=>s+i.qty,0);
 return <Ctx.Provider value={{items,add,update,clear,total,count}}>{children}</Ctx.Provider>
}
export const useCart=()=>useContext(Ctx);
