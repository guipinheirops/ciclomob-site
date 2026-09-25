import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Ciclo MOB | Autoconhecimento começa na observação",description:"Observe seu corpo, registre suas percepções e acompanhe a história dos seus ciclos com mais clareza, presença e consciência.",icons:{icon:[{url:"/favicon.svg?v=70",type:"image/svg+xml"},{url:"/favicon-v70.png",sizes:"192x192",type:"image/png"}],shortcut:"/favicon-v70.png",apple:"/favicon-v70.png"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}
