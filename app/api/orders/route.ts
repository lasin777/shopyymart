import {checkoutSchema,consolidate,shippingFor,type OrderItem} from '@/lib/domain';
import {reserveLineSQL,decrementStockSQL} from '@/lib/order-sql';
import {handle,json,db,sameOrigin,readBody,rateLimit,HttpError,getSettings,productFrom,digest,orderFrom,publicOrder} from '@/lib/server';
export async function POST(request:Request){return handle(async()=>{
  sameOrigin(request);
  const input=checkoutSchema.parse(await readBody(request));
  let items;try{items=consolidate(input.items);}catch{throw new HttpError(400,'Maximum 20 of each item per order.');}
  const requestHash=await digest(JSON.stringify({customer:input.customer,items,expectedTotal:input.expectedTotal}));
  const prior=await db().prepare('SELECT * FROM orders WHERE request_key=?').bind(input.requestKey).first<Record<string,unknown>>();
  if(prior){if(prior.request_hash!==requestHash)throw new HttpError(409,'This checkout changed. Please start a new order.');return json({order:publicOrder(orderFrom(prior))});}
  await rateLimit(request,'checkout',8,3600);
  const {settings}=await getSettings();if(!settings.acceptOrders)throw new HttpError(409,'The store is not accepting orders right now.');
  const rows=await db().prepare(`SELECT * FROM products WHERE id IN (${items.map(()=>'?').join(',')})`).bind(...items.map(i=>i.id)).all<Record<string,unknown>>();
  const products=rows.results.map(productFrom);
  const snapshots:OrderItem[]=items.map(item=>{const p=products.find(p=>p.id===item.id);if(!p||p.status!=='live'||p.stock<item.quantity)throw new HttpError(409,'An item is no longer available in this quantity. Refresh your bag.');return {id:p.id,name:p.name,price:p.price,quantity:item.quantity,image:p.images[0]||null};});
  const subtotal=snapshots.reduce((s,i)=>s+i.price*i.quantity,0);const shipping=shippingFor(subtotal,settings);const total=subtotal+shipping;
  if(total!==input.expectedTotal)throw new HttpError(409,'Prices or shipping changed. Please refresh your bag before ordering.');
  const id='SN-'+crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase();const now=Date.now();
  const queries=[db().prepare(`INSERT INTO orders (id,request_key,request_hash,phone,customer,items,subtotal,shipping,total,status,tracking_url,note,version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,'new','','',1,?,?)`).bind(id,input.requestKey,requestHash,input.customer.phone,JSON.stringify(input.customer),JSON.stringify(snapshots),subtotal,shipping,total,now,now)];
  for(const item of snapshots){queries.push(db().prepare(reserveLineSQL).bind(crypto.randomUUID(),id,item.id,item.quantity,item.price,item.quantity,item.id));queries.push(db().prepare(decrementStockSQL).bind(item.quantity,now,item.id));}
  try{await db().batch(queries);}catch{
    const retry=await db().prepare('SELECT * FROM orders WHERE request_key=?').bind(input.requestKey).first<Record<string,unknown>>();
    if(retry&&retry.request_hash===requestHash)return json({order:publicOrder(orderFrom(retry))});
    throw new HttpError(409,'Stock or price changed while you were checking out. Refresh your bag and try again.');
  }
  return json({order:{id,items:snapshots,total,status:'new',trackingUrl:'',note:'',createdAt:now,updatedAt:now}},201);
});}
