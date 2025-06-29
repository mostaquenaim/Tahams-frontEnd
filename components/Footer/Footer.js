import Link from 'next/link';
import { AiTwotoneHeart } from 'react-icons/ai';
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

const Footer = () => {
    const linkStyle = 'link link-hover'
    return (
        <>
            <footer className="footer p-10 bg-black text-white">
                <nav>
                    <header className="footer-title">Contact</header>
                    <p className="">2nd Floor, 2-G/8, Maa House,<br />Golden Street, Ring Rd, Dhaka 1207</p>
                    <p className="">Display Center: 35-36, 2nd Floor, Shahabuddin Plaza,<br />Ring Road, Dhaka, Bangladesh 1207</p>
                    <a href="tel:01602054102" className={`${linkStyle}`}>
                        01602054102
                    </a>
                    <a href="mailto:tahamsbd@gmail.com" className={`${linkStyle}`}>
                        tahamsbd@gmail.com
                    </a>
                </nav>
                <nav>
                    <header className="footer-title">Company</header>
                    <Link href="/#about" className={`${linkStyle}`}>About us</Link>
                    <Link href="/contact" className={`${linkStyle}`}>Contact</Link>
                    <Link href="/contact" className={`${linkStyle}`}>Jobs</Link>
                    <Link href="/press" className={`${linkStyle}`}>Press kit</Link>
                </nav>
                <nav>
                    <header className="footer-title">Legal</header>
                    <Link href="/" className={`${linkStyle}`}>Terms of use</Link>
                    <Link href="/" className={`${linkStyle}`}>Privacy policy</Link>
                    <Link href="/" className={`${linkStyle}`}>Cookie policy</Link>
                </nav>
                <nav>
                    <header className="footer-title">Help</header>
                    <Link href="/contact" className={`${linkStyle}`}>Become Affiliate</Link>
                    <Link href="/contact" className={`${linkStyle}`}>Affiliate FAQ</Link>
                    <Link href="/my-orders" className={`${linkStyle}`}>Track Orders</Link>
                </nav>
            </footer>
            <footer className="footer px-10 py-4 border-t bg-black border-base-300 text-white">
                <aside className="items-center grid-flow-col">
                    <div className='text-center text-sm opacity-60'>
                        <p>COPYRIGHT © 2023 TahamsBD.</p>
                        <p className='w-full text-center'>
                            Made by <a href='https://www.facebook.com/sammtech.co' target='_blank' rel="noreferrer" className="underline hover:opacity-70">SammTech</a> with <AiTwotoneHeart className='inline-block text-red-500' />
                        </p>
                    </div>
                </aside>
                <nav className="md:place-self-center md:justify-self-end">
                    <div className="grid grid-flow-col gap-4">
                        <a href='https://www.facebook.com/tahamsbd/' target='_blank' rel="noreferrer"><FaFacebook className='text-2xl hover:opacity-70' /></a>
                        <a href='https://www.instagram.com/tahams_bd/' target='_blank' rel="noreferrer"><FaInstagram className='text-2xl hover:opacity-70' /></a>
                        <a href='https://www.tiktok.com/@tahams_bd' target='_blank' rel="noreferrer"><FaTiktok className='text-2xl hover:opacity-70' /></a>
                    </div>
                </nav>
            </footer>
        </>
    );
};

export default Footer;
