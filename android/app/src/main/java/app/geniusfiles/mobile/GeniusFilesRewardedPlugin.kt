package app.geniusfiles.mobile

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.android.libraries.ads.mobile.sdk.common.AdLoadCallback
import com.google.android.libraries.ads.mobile.sdk.common.AdRequest
import com.google.android.libraries.ads.mobile.sdk.common.FullScreenContentError
import com.google.android.libraries.ads.mobile.sdk.rewarded.RewardedAd
import com.google.android.libraries.ads.mobile.sdk.rewarded.RewardedAdEventCallback
import com.google.android.libraries.ads.mobile.sdk.rewarded.OnUserEarnedRewardListener
import com.google.android.libraries.ads.mobile.sdk.rewarded.RewardItem
import com.google.android.libraries.ads.mobile.sdk.common.LoadAdError

/**
 * Annonce récompensée AdMob (GMA Next-Gen).
 *
 * L'annonce est préchargée en arrière-plan puis affichée **uniquement** sur
 * demande explicite de l'utilisateur. La récompense n'est signalée à la
 * couche web que si le SDK l'a réellement validée (`onUserEarnedReward`) :
 * fermer l'annonce avant la fin ne crédite rien.
 *
 * Le jeton (`nonce`) fourni par la page est renvoyé tel quel afin que la
 * couche web n'accepte qu'une récompense correspondant à sa propre demande,
 * et une seule fois.
 *
 * Aucune donnée personnelle n'est transmise au SDK par ce pont.
 */
@CapacitorPlugin(name = "GeniusFilesRewarded")
class GeniusFilesRewardedPlugin : Plugin() {
    private var ad: RewardedAd? = null
    private var loading = false
    private var pendingCall: PluginCall? = null
    private var pendingNonce: String? = null
    private var earned = false

    @PluginMethod
    fun isAvailable(call: PluginCall) {
        call.resolve(JSObject().put("available", true))
    }

    @PluginMethod
    fun getStatus(call: PluginCall) {
        call.resolve(JSObject().put("ready", ad != null))
    }

    @PluginMethod
    fun preload(call: PluginCall) {
        val unitId = call.getString("unitId") ?: TEST_REWARDED_UNIT_ID
        load(unitId)
        call.resolve(JSObject().put("ready", ad != null))
    }

    /** Charge une annonce si aucune n'est déjà disponible ou en cours. */
    private fun load(unitId: String) {
        if (ad != null || loading) return
        loading = true
        try {
            val request = AdRequest.Builder(unitId).build()
            RewardedAd.load(
                request,
                object : AdLoadCallback<RewardedAd> {
                    override fun onAdLoaded(loaded: RewardedAd) {
                        loading = false
                        ad = loaded
                    }

                    override fun onAdFailedToLoad(adError: LoadAdError) {
                        loading = false
                        ad = null
                    }
                },
            )
        } catch (_: Throwable) {
            loading = false
            ad = null
        }
    }

    /**
     * Affiche l'annonce et ne répond qu'à sa fermeture, avec le résultat
     * réel du visionnage.
     */
    @PluginMethod
    fun show(call: PluginCall) {
        val unitId = call.getString("unitId") ?: TEST_REWARDED_UNIT_ID
        val nonce = call.getString("nonce") ?: ""
        if (pendingCall != null) {
            call.resolve(JSObject().put("rewarded", false).put("error", "busy"))
            return
        }
        val current = ad
        if (current == null) {
            load(unitId)
            call.resolve(JSObject().put("rewarded", false).put("error", "unavailable"))
            return
        }

        pendingCall = call
        pendingNonce = nonce
        earned = false

        activity.runOnUiThread {
            try {
                current.adEventCallback = object : RewardedAdEventCallback {
                    override fun onAdDismissedFullScreenContent() {
                        finish(true)
                        ad = null
                        load(unitId)
                    }

                    override fun onAdFailedToShowFullScreenContent(error: FullScreenContentError) {
                        ad = null
                        finish(false, "show-failed")
                        load(unitId)
                    }
                }
                current.show(
                    activity,
                    object : OnUserEarnedRewardListener {
                        override fun onUserEarnedReward(reward: RewardItem) {
                            earned = true
                        }
                    },
                )
            } catch (t: Throwable) {
                ad = null
                finish(false, t.message ?: "show-error")
            }
        }
    }

    /** Répond une seule fois à la demande d'affichage en cours. */
    private fun finish(dismissed: Boolean, error: String? = null) {
        val call = pendingCall ?: return
        pendingCall = null
        val nonce = pendingNonce ?: ""
        pendingNonce = null
        val result = JSObject()
            .put("rewarded", dismissed && earned)
            .put("nonce", nonce)
        if (error != null) result.put("error", error)
        earned = false
        call.resolve(result)
    }

    override fun handleOnDestroy() {
        super.handleOnDestroy()
        finish(false, "destroyed")
        ad = null
    }

    companion object {
        /** Bloc de TEST officiel Google (annonce récompensée). */
        const val TEST_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/5224354917"
    }
}
