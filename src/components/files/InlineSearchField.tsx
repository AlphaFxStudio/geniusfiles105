import { Search, X } from "@/components/icons";

import { useT } from "@/lib/i18n";

/**
 * Champ de recherche contextuel — style unique partagé avec la recherche
 * globale : un seul anneau bleu, posé sur le bord extérieur du champ
 * (aucun contour interne). Utilisé par le gestionnaire de fichiers, les
 * catégories et les fichiers récents afin que les deux interfaces de
 * recherche soient parfaitement cohérentes.
 */
export function InlineSearchField({
  value,
  onChange,
  onClose,
  placeholder,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  const t = useT();
  return (
    <div className="mb-2 mt-2">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-11 w-full rounded-3xl border border-border bg-surface-elevated pl-10 pr-11 text-[13.5px] text-foreground outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 focus-visible:shadow-none"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label={t("viewer.document.closeSearch")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </label>
    </div>
  );
}
