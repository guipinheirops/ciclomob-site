import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Ciclo MOB | Autoconhecimento começa na observação",description:"Observe seu corpo, registre suas percepções e acompanhe a história dos seus ciclos com mais clareza, presença e consciência.",icons:{icon:"/ciclo-mob-logo-oficial.png",shortcut:"/ciclo-mob-logo-oficial.png",apple:"/ciclo-mob-logo-oficial.png"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}
