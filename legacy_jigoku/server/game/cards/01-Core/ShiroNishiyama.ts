import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class ShiroNishiyama extends StrongholdCard {
    static id = 'shiro-nishiyama';

    setupCardAbilities() {
        this.action({
            title: 'Give defending characters +1/+1',
            cost: AbilityDsl.costs.bowSelf(),
            condition: () => this.game.isDuringConflict(),
            effect: 'add +1{1}/+1{2} to all defenders they control',
            effectArgs: () => ['military', 'political'],
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.player.cardsInPlay.filter((card) => card.isDefending()),
                effect: AbilityDsl.effects.modifyBothSkills(1)
            }))
        });
    }
}
