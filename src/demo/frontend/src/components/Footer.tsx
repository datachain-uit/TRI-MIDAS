import { ArrowRight, Facebook, Github, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <>
      {/* ---  FOOTER --- */}
      <footer className="relative  bg-[#1a1a1a] h-[50vh]  text-gray-400 py-12 px-6 border-t border-gray-800 ">
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dpqv7ag5w/image/upload/v1766052281/Footer_37_ijf3v4.png')] "></div>

        <div className="max-w-[80vw] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 text-xs md:text-sm">
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Landing Page
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">
              Data Sources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Kaggle
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  University API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Research Papers
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase">Social</h4>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                <Twitter size={18} />
              </a>
              <a href="#" className="hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram size={18} />
              </a>
              <a href="#" className="hover:text-white">
                <Github size={18} />
              </a>
            </div>
            <div className="mt-6">
              <p className="mb-2">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-gray-800 border-none rounded-l px-3 py-2 text-white w-full focus:ring-1 ring-[#B93836]"
                />
                <button className="bg-[#B93836] text-white px-3 py-2 rounded-r hover:bg-[#8e2b29]">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className=" text-center mt-12 text-xs text-gray-400 relative z-10">
          © Nhom 1 DS317.
        </div>
      </footer>
    </>
  );
}
