import Link from "next/link";

export default function Navigation() {
  return (
    <>
      <Link href="/">Home</Link>
      <br />
      <Link href="/about">About Us</Link>
      <br />
      <Link href="/contact">Contact Us</Link>
      <br />
      <Link href="/admin">Admin Dashboard</Link>
      <br />
      <Link href="/admin/listers">Listers</Link>
    </>
  );
}