import { Zap, X, Globe, GitFork } from "lucide-react";

const LINKS = {
  Producto: ["Características", "Precios", "Changelog", "Roadmap"],
  Empresa: ["Nosotros", "Blog", "Carreras", "Prensa"],
  Legal: ["Privacidad", "Términos", "Cookies"],
};

const SOCIAL_ICONS = [X, Globe, GitFork];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">
                Clarity<span className="text-violet-400">Flow</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              La plataforma SaaS que da claridad total a tu equipo.
            </p>
            <div className="flex gap-4 mt-5">
              {SOCIAL_ICONS.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-violet-600 flex items-center justify-center transition-colors"
                  aria-label="Red social"
                >
                  <Icon className="w-4 h-4 text-slate-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p>© {new Date().getFullYear()} Clarity Flow, Inc. Todos los derechos reservados.</p>
          <p className="text-slate-600">
            Hecho con ❤️ en Next.js 15 + Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
