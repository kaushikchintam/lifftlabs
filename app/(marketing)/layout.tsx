import  Nav  from "@/components/layout/nav";

interface MarketingLayoutProps {
    children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
    return (
        <>
        <Nav />
        <main> {children}</main>
        </>
    )
}