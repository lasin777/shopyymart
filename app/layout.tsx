import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'ShopNest — Everyday, elevated.',description:'A considered collection of home and technology essentials. Discover ShopNest.',icons:{icon:'/favicon.svg'},robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
