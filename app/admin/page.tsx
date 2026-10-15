import Admin from './panel';
import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';
import {isAdmin,ADMIN_EMAIL} from '@/lib/domain';
import {Brand} from '../components';
export const dynamic='force-dynamic';
export default async function AdminPage(){const user=await requireChatGPTUser('/admin');if(!isAdmin(user))return <main className="access-page"><Brand/><div className="eyebrow">STORE MANAGEMENT</div><h1>For the store<br/><em>owner.</em></h1><p>You’re signed in as {user.email}. Store management is available to {ADMIN_EMAIL}.</p><a className="button gold" href={chatGPTSignOutPath('/admin')} target="_top">Switch account</a><a className="text-link" href="/">Back to the store</a></main>;return <Admin email={user.email} signOut={chatGPTSignOutPath('/')}/>;}
