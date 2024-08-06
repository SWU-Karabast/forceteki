import { CharacterStatus } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class PledgeOfLoyalty extends ProvinceCard {
    static id = 'pledge-of-loyalty';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Prevent a character from leaving play',
            when: {
                onCardLeavesPlay: (event, context) => event.card.controller === context.player && event.card.isHonored
            },
            effect: 'prevent {1} from leaving play',
            effectArgs: (context) => context.event.card,
            gameAction: AbilityDsl.actions.cancel((context) => ({
                replacementGameAction: AbilityDsl.actions.discardStatusToken({
                    target: (context as any).event.card.getStatusToken(CharacterStatus.Honored)
                })
            }))
        });
    }
}
