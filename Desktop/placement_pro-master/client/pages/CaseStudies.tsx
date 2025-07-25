import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function CaseStudies() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 to-brand-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Case Studies
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This page is coming soon. We'll showcase real-world applications
              and success stories here.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
