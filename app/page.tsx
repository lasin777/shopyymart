import Storefront from './storefront';
import {getProducts,getSettings} from '@/lib/server';
import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
import {defaultSettings,isAdmin} from '@/lib/domain';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await getChatGPTUser();
 try{const [products,{settings}]=await Promise.all([getProducts(),getSettings()]);return <Storefront initialProducts={products} initialSettings={settings} admin={isAdmin(user)} signIn={chatGPTSignInPath('/admin')}/>;}
 catch{return <Storefront initialProducts={[]} initialSettings={defaultSettings} admin={isAdmin(user)} signIn={chatGPTSignInPath('/admin')} initialError="The collection is temporarily unavailable. Please try again."/>;}
}
