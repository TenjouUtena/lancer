import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Lancer",
  description: "Just talk to Kredden",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className={"absolute top-0 left-0 right-0 bg-red-600 h-10 p-1"}>Lancer</div>

        <div className="absolute top-10 bg-red-600 bottom-0 p-1">
          <p className="hover:bg-red-900 m-1 p-1"><a href="/">Home</a></p>
          <p className="hover:bg-red-900 m-1 p-1"><a>Customers</a></p>
          <p className="hover:bg-red-900 m-1 p-1"><a href="/orders">Orders</a></p>
          <p className="hover:bg-red-900 m-1 p-1"><a href="/artists">Artists</a></p>


        </div>
        <div className="top-11 left-28 absolute">{children}</div>
      </body>
    </html>
  );
}
