/**
 * Présentation du quota quotidien d'une fonctionnalité freemium.
 *
 * Affiche le nombre d'utilisations restantes, l'heure de renouvellement et,
 * quand c'est utile, l'invitation **volontaire** à regarder une annonce pour
 * obtenir une utilisation supplémentaire. Aucune annonce ne se déclenche
 * sans un appui explicite.
 */
import { Sparkles, Clock3, PlayCircle, Loader2 } from "@/components/icons";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";
import { useQuota, useRenewalCountdown, useRewardedUse } from "@/lib/quota/useQuota";
import type { QuotaFeature } from "@/lib/quota/store";

function formatDelay(ms: number): string {
  const total = Math.max(0, Math.round(ms / 60000));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours <= 0) return `${minutes} min`;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function QuotaBadge({
  feature,
  className = "",
}: {
  feature: QuotaFeature;
  className?: string;
}) {
  const t = useT();
  const quota = useQuota(feature);
  const countdown = useRenewalCountdown();
  const { watch, watching, available } = useRewardedUse(feature);

  const empty = quota.remaining <= 0;

  const onWatch = async () => {
    const outcome = await watch();
    if (outcome === "granted") toast.success(t("quota.rewarded.success"));
    else if (outcome === "unavailable") toast.info(t("quota.unavailable"));
    else toast.warning(t("quota.rewarded.failed"));
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-border/60 bg-surface px-3 py-2 ${className}`}
    >
      <span
        className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${
          empty ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={2.2} />
        {empty ? t("quota.none") : t("quota.remaining", { count: quota.remaining })}
      </span>

      <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
        {quota.pendingRenewal
          ? t("quota.pending")
          : t("quota.renewal", { time: formatDelay(countdown) })}
      </span>

      {available && quota.canEarn ? (
        <button
          type="button"
          onClick={() => void onWatch()}
          disabled={watching}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-primary/12 px-2.5 py-1.5 text-[12px] font-semibold text-primary transition-transform active:scale-95 disabled:opacity-60"
        >
          {watching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.2} />
          ) : (
            <PlayCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
          )}
          {watching ? t("quota.watching") : t("quota.watch")}
        </button>
      ) : null}

      {available && !quota.canEarn ? (
        <span className="ml-auto text-[11.5px] text-muted-foreground">{t("quota.max")}</span>
      ) : null}
    </div>
  );
}
