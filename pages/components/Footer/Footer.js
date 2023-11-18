import Link from 'next/link';
import React from 'react';
import { AiTwotoneHeart } from 'react-icons/ai';
import { FaFacebook, FaInstagram, FaTiktok  } from "react-icons/fa";

const Footer = () => {
    return (
        <>
            <footer className="footer p-10 bg-black text-white">
                <nav>
                    <header className="footer-title">Contact</header>
                    <Link href='/' className="link link-hover">2nd Floor, 2-G/8, Maa House, <br></br> Golden Street, Ring Rd, Dhaka 1207</Link>
                    <Link href='/' className="link link-hover">01602054102</Link>
                    <Link href='/' className="link link-hover">tahamsbd@gmail.com</Link>
                </nav>
                <nav>
                    <header className="footer-title">Company</header>
                    <Link href='/' className="link link-hover">About us</Link>
                    <Link href='/' className="link link-hover">Contact</Link>
                    <Link href='/' className="link link-hover">Jobs</Link>
                    <Link href='/' className="link link-hover">Press kit</Link>
                </nav>
                <nav>
                    <header className="footer-title">Legal</header>
                    <Link href='/' className="link link-hover">Terms of use</Link>
                    <Link href='/' className="link link-hover">Privacy policy</Link>
                    <Link href='/' className="link link-hover">Cookie policy</Link>
                </nav>
                <nav>
                    <header className="footer-title">Help</header>
                    <Link href='/' className="link link-hover">Become Affiliate</Link>
                    <Link href='/' className="link link-hover">Affiliate FAQ</Link>
                    <Link href='/' className="link link-hover">Track Orders</Link>
                </nav>
            </footer>
            <footer className="footer px-10 py-4 border-t bg-black border-base-300 text-white">
                <aside className="items-center grid-flow-col">
                    <div className=' text-center text-sm opacity-60 '>
                        <p>COPYRIGHT © 2023 TahamsBD.</p>
                        <p className='w-full text-center'>Made by <a href='https://www.facebook.com/sammtech.co' target='_blank' rel="noreferrer">SammTech</a> with <AiTwotoneHeart className='inline-block'></AiTwotoneHeart></p>
                    </div>
                </aside>
                <nav className="md:place-self-center md:justify-self-end">
                    <div className="grid grid-flow-col gap-4">
                        <Link href='https://www.facebook.com/tahamsbd/'><FaFacebook  className='text-2xl hover:opacity-70'></FaFacebook></Link>
                        <Link href='https://www.instagram.com/tahams_bd/'><FaInstagram className='text-2xl hover:opacity-70'></FaInstagram></Link>
                        <Link href='https://www.tiktok.com/@tahams_bd'><FaTiktok    className='text-2xl hover:opacity-70'></FaTiktok></Link>
                    </div>
                </nav>
            </footer>
        </>
    );
};

export default Footer;