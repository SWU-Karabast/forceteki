import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class EffectiveDeception extends ProvinceCard {
    static id = 'effective-deception';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel triggered ability',
            when: {
                onInitiateAbilityEffects: (event, context) =>
                    context.source.isConflictProvince() && event.context.ability.isTriggeredAbility()
            },
            effect: "cancel the effects of {1}'s ability",
            effectArgs: (context) => context.event.card,
            gameAction: AbilityDsl.actions.cancel()
        });
    }
}
