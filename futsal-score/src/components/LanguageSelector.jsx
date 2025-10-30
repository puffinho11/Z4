import React, { useState, useRef, useEffect } from "react";
import i18n from "../i18n/i18n";

const LanguageSelector = () => {
  const savedLang = localStorage.getItem("lang") || "pt";
  const [selected, setSelected] = useState({
    code: savedLang,
    ...getLanguageData(savedLang),
  });
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Define as bandeiras e nomes
  function getLanguageData(code) {
    const langs = {
      pt: { name: "Português", flag: "https://flagcdn.com/w20/br.png" },
      en: { name: "English", flag: "https://flagcdn.com/w20/us.png" },
      es: { name: "Español", flag: "https://flagcdn.com/w20/es.png" },
    };
    return langs[code] || langs.pt;
  }

  // Atualiza o idioma ao carregar o componente
  useEffect(() => {
    i18n.changeLanguage(savedLang);
  }, []);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (langCode) => {
    const lang = getLanguageData(langCode);
    setSelected({ code: langCode, ...lang });
    i18n.changeLanguage(langCode); // ✅ muda o idioma na hora
    localStorage.setItem("lang", langCode); // ✅ salva o idioma
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition text-sm font-medium shadow-sm"
      >
        <img src={selected.flag} alt={selected.name} className="w-5 h-4" />
        {selected.name}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {["pt", "en", "es"].map((langCode) => {
            const lang = getLanguageData(langCode);
            return (
              <li
                key={langCode}
                onClick={() => handleSelect(langCode)}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                  selected.code === langCode ? "bg-gray-50 font-semibold" : ""
                }`}
              >
                <img src={lang.flag} alt={lang.name} className="w-5 h-4" />
                {lang.name}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSelector;

