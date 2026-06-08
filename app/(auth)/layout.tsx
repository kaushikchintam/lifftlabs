// import '/globals.css'

export default function RootLayout({ children }: { children: React.ReactNode}) {
    return (
        <div>
            <h1>Welcome to the Auth Page</h1>
            {children}
        </div>
    );
}
