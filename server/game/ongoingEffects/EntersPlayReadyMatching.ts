import type { AbilityContext } from '../core/ability/AbilityContext';
import { EffectName } from '../core/Constants';
import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import type { Player } from '../core/Player';
import type { IEntersPlayReadyMatcherProperties } from '../core/playerEffect/EntersPlayReadyMatcher';
import { EntersPlayReadyMatcher } from '../core/playerEffect/EntersPlayReadyMatcher';

export function entersPlayReadyMatching(properties: IEntersPlayReadyMatcherProperties) {
    return OngoingEffectBuilder.player.detached(EffectName.MatchingPlayedUnitEntersPlayReady, {
        apply: (player: Player, context: AbilityContext) => {
            // Clone the limit so each registration of the matcher gets its own counter.
            const propertiesWithClonedLimit = { ...properties, limit: properties.limit?.clone() };
            const matcher = new EntersPlayReadyMatcher(context.game, context.source, propertiesWithClonedLimit);
            player.addEntersPlayReadyMatcher(matcher);
            return matcher;
        },
        unapply: (player: Player, _context: AbilityContext, matcher: EntersPlayReadyMatcher) =>
            player.removeEntersPlayReadyMatcher(matcher)
    });
}
