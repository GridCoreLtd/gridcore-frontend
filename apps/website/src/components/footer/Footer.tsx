import BottomFooter from "./BottomFooter";
import TopFooter from "./TopFooter";

// Plain navy: every page now ends on a light section, so the footer no longer
// has to distinguish itself from a dark one above it.
const Footer = () => (
  <footer className="bg-primary text-white">
    <TopFooter />
    <div className="border-t border-white/10" />
    <BottomFooter />
  </footer>
);

export default Footer;
