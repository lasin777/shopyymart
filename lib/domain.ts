import { z } from 'zod';

export const ADMIN_EMAIL = 'lasin90746@gmail.com';
export function isAdmin(identity: {userId: string; email: string} | null) {
  return !!identity?.userId && identity.email.toLowerCase() === ADMIN_EMAIL;
}
export const money = (n:number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:n%100 ? 2:0}).format(n/100);
export const statuses = ['new','confirmed','packed','shipped','delivered','cancelled'] as const;
export type Status = typeof statuses[number];
export const statusLabels:Record<Status,string> = {new:'Order received',confirmed:'Confirmed',packed:'Packed',shipped:'On the way',delivered:'Delivered',cancelled:'Cancelled'};
export const transitions:Record<Status,Status[]> = {new:['confirmed','cancelled'],confirmed:['packed','cancelled'],packed:['shipped','cancelled'],shipped:['delivered'],delivered:[],cancelled:[]};
export function canTransition(from:Status,to:Status) { return from === to || transitions[from]?.includes(to); }
export const categories = ['electronics','home'] as const;
export const states = ['Andaman and Nicobar Islands','Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chandigarh','Chhattisgarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu and Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Lakshadweep','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Puducherry','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];
export const imageUrl = z.string().max(2000).refine(value => {
  if (/^\/media\/[a-f0-9-]+\.(jpg|png|webp)$/.test(value)) return true;
  try {const u=new URL(value);return u.protocol==='https:' && !u.username && !u.password;} catch {return false;}
},'Use an HTTPS image URL or upload an image.');
export const phoneSchema = z.string().transform(v=>v.replace(/[\s()-]/g,'').replace(/^\+91/,'').replace(/^0091/,''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/,'Enter a valid 10-digit Indian mobile number.'));
export const productSchema = z.object({
  id:z.string().uuid().optional(), version:z.number().int().positive().optional(),
  name:z.string().trim().min(2).max(100),description:z.string().trim().min(10).max(2500),category:z.enum(categories),
  price:z.number().int().min(100).max(100000000),comparePrice:z.number().int().min(100).max(100000000).nullable(),
  stock:z.number().int().min(0).max(100000),status:z.enum(['draft','live','archived']),
  images:z.array(imageUrl).max(4),featured:z.boolean(),
}).refine(p=>p.comparePrice===null||p.comparePrice>=p.price,{message:'Original price cannot be lower than selling price.',path:['comparePrice']});
export type Product = z.infer<typeof productSchema> & {id:string;version:number;createdAt?:number;updatedAt?:number};
export const settingsSchema=z.object({
  name:z.string().trim().min(2).max(40),tagline:z.string().trim().min(3).max(160),
  email:z.string().email().max(150),whatsapp:phoneSchema,
  delivery:z.string().trim().min(3).max(100),shipping:z.number().int().min(0).max(500000),
  freeOver:z.number().int().min(0).max(100000000),acceptOrders:z.boolean(),
  returns:z.string().trim().min(10).max(1500),
});
export type Settings = z.infer<typeof settingsSchema>;
export const defaultSettings:Settings={name:'ShopNest',tagline:'Thoughtful essentials. Everyday elevated.',email:'shopnest2030@gmail.com',whatsapp:'9544411578',delivery:'Delivery estimate confirmed after your order',shipping:0,freeOver:0,acceptOrders:true,returns:'Contact our support team about returns or a damaged item. Return eligibility and the next steps will be confirmed with you before you send anything back.'};
export const customerSchema=z.object({name:z.string().trim().min(2).max(80),phone:phoneSchema,alternate:z.union([z.literal(''),phoneSchema]).default(''),address:z.string().trim().min(10).max(300),city:z.string().trim().min(2).max(80),state:z.string().refine(v=>states.includes(v),'Select a state.'),pin:z.string().regex(/^[1-9]\d{5}$/,'Enter a valid six-digit PIN code.')});
export const checkoutSchema=z.object({requestKey:z.string().uuid(),customer:customerSchema,items:z.array(z.object({id:z.string().uuid(),quantity:z.number().int().min(1).max(20)})).min(1).max(30),expectedTotal:z.number().int().positive()});
export function shippingFor(subtotal:number,settings:Settings){return settings.freeOver>0 && subtotal>=settings.freeOver ? 0 : settings.shipping;}
export function consolidate(items:{id:string;quantity:number}[]){const merged=new Map<string,number>();for(const i of items)merged.set(i.id,(merged.get(i.id)||0)+i.quantity);for(const n of merged.values())if(n>20)throw new Error('Maximum 20 of each item per order.');return [...merged].map(([id,quantity])=>({id,quantity})).sort((a,b)=>a.id.localeCompare(b.id));}
export type OrderItem={id:string;name:string;price:number;quantity:number;image:string|null};
export type Order={id:string;phone:string;customer:z.infer<typeof customerSchema>;items:OrderItem[];subtotal:number;shipping:number;total:number;status:Status;trackingUrl:string;note:string;version:number;createdAt:number;updatedAt:number};
export type Tracking=Pick<Order,'id'|'items'|'total'|'status'|'trackingUrl'|'note'|'createdAt'|'updatedAt'>;
export const trackingSchema=z.object({id:z.string().trim().toUpperCase().regex(/^SN-[A-F0-9]{12}$/,'Check your order reference.'),phone:phoneSchema});
