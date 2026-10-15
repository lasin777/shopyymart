import {handle,json,getProducts,getSettings} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(){return handle(async()=>{const [products,{settings}]=await Promise.all([getProducts(),getSettings()]);return json({products,settings});});}
