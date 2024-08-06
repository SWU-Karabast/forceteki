import { TargetModes, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class OfferingsToTheKami extends ProvinceCard {
    static id = 'offerings-to-the-kami';

    setupCardAbilities() {
        this.reaction({
            title: 'Resolve the ring as if you were the attacker',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            target: {
                mode: TargetModes.Ring,
                activePromptTitle: 'Choose a ring to claim and resolve',
                player: Players.Self,
                ringCondition: (ring) => ring.isUnclaimed(),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.resolveRingEffect((context) => ({ player: context.player })),
                    AbilityDsl.actions.claimRing({ takeFate: true, type: 'political' })
                ])
            }
        });
    }
}
