import {productSchema} from '@/lib/domain';
import {handle,json,requireAdmin,readBody,getProducts,db,HttpError} from '@/lib/server';
export async function GET(request:Request){return handle(async()=>{await requireAdmin(request);return json({products:await getProducts(true)});});}
export async function POST(request:Request){return handle(async()=>{await requireAdmin(request);const p=productSchema.parse(await readBody(request));const now=Date.now();const id=p.id||crypto.randomUUID();
if(p.id){if(!p.version)throw new HttpError(400,'Missing product version.');const r=await db().prepare('UPDATE products SET name=?,description=?,category=?,price=?,compare_price=?,stock=?,status=?,images=?,featured=?,version=version+1,updated_at=? WHERE id=? AND version=?').bind(p.name,p.description,p.category,p.price,p.comparePrice,p.stock,p.status,JSON.stringify(p.images),p.featured?1:0,now,id,p.version).run();if(r.meta.changes!==1)throw new HttpError(409,'This product changed. Reload before editing it again.');}
else{await db().prepare('INSERT INTO products(id,name,description,category,price,compare_price,stock,status,images,featured,version,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,1,?,?)').bind(id,p.name,p.description,p.category,p.price,p.comparePrice,p.stock,p.status,JSON.stringify(p.images),p.featured?1:0,now,now).run();}
return json({id,products:await getProducts(true)});});}
