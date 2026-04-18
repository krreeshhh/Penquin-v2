import React from "react";
import { 
  SiGithub, SiGitlab, SiBitbucket, SiMedium, SiGitbook, 
  SiNotion, SiGeeksforgeeks, 
  SiHackthebox, SiTryhackme, SiBurpsuite, SiHackerone, 
  SiBugcrowd, SiIntigriti, SiGoogle,
  SiDiscord, SiYoutube, SiFacebook, SiSimpleicons, SiVirustotal, SiLetsencrypt, SiRss,
  SiKalilinux, SiLinux
} from "react-icons/si";
import { FaLinkedin, FaXTwitter, FaAws, FaMicrosoft } from "react-icons/fa6";
import { Search, Globe, Shield, Terminal, Book, Cpu, Cloud, Radio, Eye } from "lucide-react";

interface SiteIconProps {
  domain: string;
  className?: string;
}

export function SiteIcon({ domain, className }: SiteIconProps) {
  const d = domain.toLowerCase();

  // Platform & Code
  if (d.includes("github")) return <SiGithub className={className} />;
  if (d.includes("gitlab")) return <SiGitlab className={className} />;
  if (d.includes("bitbucket")) return <SiBitbucket className={className} />;

  // Blogs & Articles
  if (d.includes("medium")) return <SiMedium className={className} />;
  if (d.includes("gitbook") || d.includes("hacktricks")) return <SiGitbook className={className} />;
  if (d.includes("notion")) return <SiNotion className={className} />;
  if (d.includes("geeksforgeeks")) return <SiGeeksforgeeks className={className} />;
  if (d.includes("tutorialspoint")) return <Book className={className} />; // Fallback
  if (d.includes("netspi") || d.includes("trailofbits")) return <SiRss className={className} />;

  // Hacking Labs
  if (d.includes("hackthebox")) return <SiHackthebox className={className} />;
  if (d.includes("tryhackme")) return <SiTryhackme className={className} />;
  if (d.includes("portswigger")) return <SiBurpsuite className={className} />;
  if (d.includes("hackerone")) return <SiHackerone className={className} />;
  if (d.includes("bugcrowd")) return <SiBugcrowd className={className} />;
  if (d.includes("intigriti")) return <SiIntigriti className={className} />;
  if (d.includes("pentesterlab")) return <SiLinux className={className} />;
  if (d.includes("exploit-db")) return <SiKalilinux className={className} />;

  // Social
  if (d === "x.com" || d.includes("twitter")) return <FaXTwitter className={className} />;
  if (d.includes("youtube")) return <SiYoutube className={className} />;
  if (d.includes("discord")) return <SiDiscord className={className} />;
  if (d.includes("linkedin")) return <FaLinkedin className={className} />;
  if (d.includes("facebook")) return <SiFacebook className={className} />;

  // Search & OSINT
  if (d.includes("google")) return <SiGoogle className={className} />;
  if (d.includes("shodan")) return <Radio className={className} />; // Fallback
  if (d.includes("censys")) return <Eye className={className} />; // Fallback
  if (d.includes("virustotal")) return <SiVirustotal className={className} />;
  if (d.includes("crt.sh") || d.includes("letsencrypt")) return <SiLetsencrypt className={className} />;
  if (d.includes("dnsdumpster") || d.includes("bgpview")) return <Search className={className} />;
  if (d.includes("haveibeenpwned")) return <Shield className={className} />;

  // Cloud
  if (d.includes("aws") || d.includes("amazon")) return <FaAws className={className} />;
  if (d.includes("azure") || d.includes("microsoft")) return <FaMicrosoft className={className} />;

  // Default
  return <Globe className={className} />;
}
