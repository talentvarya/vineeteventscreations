import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { EnquiryProvider } from "@/context/EnquiryContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Chatbot } from "@/components/Chatbot";
import { EnquiryModal } from "@/components/EnquiryModal";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "sonner";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import ArtistGallery from "@/pages/ArtistGallery";
import EventsGallery from "@/pages/EventsGallery";
import Testimonials from "@/pages/Testimonials";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

const SiteLayout = ({ children }) => (
  <>
    <Header />
    <main className="min-h-screen">{children}</main>
    <Footer />
    <WhatsAppButton />
    <Chatbot />
    <EnquiryModal />
  </>
);

function App() {
  return (
    <div className="App bg-vec">
      <BrowserRouter>
        <AuthProvider>
          <EnquiryProvider>
            <ScrollToTop />
            <Toaster position="top-center" theme="dark" richColors />
            <Routes>
              <Route path="/" element={<SiteLayout><Home /></SiteLayout>} />
              <Route path="/about" element={<SiteLayout><About /></SiteLayout>} />
              <Route path="/services" element={<SiteLayout><Services /></SiteLayout>} />
              <Route path="/artists" element={<SiteLayout><ArtistGallery /></SiteLayout>} />
              <Route path="/events" element={<SiteLayout><EventsGallery /></SiteLayout>} />
              <Route path="/testimonials" element={<SiteLayout><Testimonials /></SiteLayout>} />
              <Route path="/blog" element={<SiteLayout><Blog /></SiteLayout>} />
              <Route path="/blog/:slug" element={<SiteLayout><BlogPost /></SiteLayout>} />
              <Route path="/contact" element={<SiteLayout><Contact /></SiteLayout>} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Routes>
          </EnquiryProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
