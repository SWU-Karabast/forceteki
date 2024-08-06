import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class YojinNoShiro extends StrongholdCard {
    static id = 'yojin-no-shiro';

    setupCardAbilities() {
        this.action({
            title: 'Give attacking characters +1/+0',
            cost: AbilityDsl.costs.bowSelf(),
            condition: () => this.game.isDuringConflict(),
            effect: 'give attacking characters +1{1}/+0{2}',
            effectArgs: () => ['military', 'political'],
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.player.cardsInPlay.filter((card) => card.isAttacking()),
                effect: AbilityDsl.effects.modifyMilitarySkill(1)
            }))
        });
    }
}
