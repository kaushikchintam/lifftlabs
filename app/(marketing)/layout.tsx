import  Nav  from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import { CookieNotice } from "@/components/marketing/cookie-notice";

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
        <>
        <Nav />
        <main> {children}</main>
        <Footer />
        <CookieNotice />
        </>
    )
}