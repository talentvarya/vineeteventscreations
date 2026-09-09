import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHero } from "@/components/Section";
import { BLOGS } from "@/data/content";
import { useEnquiry } from "@/context/EnquiryContext";

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOGS.find((b) => b.slug === slug);
  const { openEnquiry } = useEnquiry();

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-24">
        <h1 className="font-display text-3xl text-yellow-400">Article not found</h1>
        <Link to="/blog" className="text-yellow-300 underline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero eyebrow={`${post.tag} • ${post.date}`} title={post.title} image={post.img} />
      <article className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link to="/blog" className="inline-flex items-center gap-2 text-yellow-400 font-semibold mb-8 hover:text-yellow-300">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="space-y-6">
            {post.body.map((p, i) => (
              <p key={i} className="text-slate-300 text-lg leading-relaxed">{p}</p>
            ))}
          </div>
          <div className="mt-12 glass-card rounded-2xl p-8 text-center gold-border-glow">
            <h3 className="font-display text-2xl font-black gold-gradient-text mb-3">Planning something dhamakedar?</h3>
            <p className="text-slate-400 mb-6">Let our 19+ years of experience bring your event to life.</p>
            <button
              data-testid="blogpost-cta-button"
              onClick={() => openEnquiry({ source: "blog" })}
              className="btn-glow pulse-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold px-8 py-3.5 rounded-full"
            >
              Book a Free Consultation
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
