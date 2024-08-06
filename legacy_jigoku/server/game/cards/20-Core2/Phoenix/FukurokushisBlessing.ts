import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { ProvinceCard } from '../../../ProvinceCard';

export default class FukurokushisBlessing extends DrawCard {
    static id = 'fukurokushi-s-blessing';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel conflict province ability',
            when: {
                onInitiateAbilityEffects: ({ card }, context) =>
                    card instanceof ProvinceCard &&
                    card.isConflictProvince() &&
                    (context.source as this).controller.isAttackingPlayer()
            },
            effect: "cancel the effects of {1}'s ability",
            effectArgs: (context) => context.event.card,
            gameAction: AbilityDsl.actions.cancel(),
            max: AbilityDsl.limit.perRound(1)
        });
    }
}