import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';
import type { UnitCard } from '../../../core/card/CardTypes';

export default class Aggression extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3736081333',
            internalName: 'aggression',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Aggression modal ability:',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 2,
                choices: () => ({
                    ['Draw a card']: AbilityHelper.immediateEffects.draw(),
                    ['Defeat up to 2 upgrades']: AbilityHelper.immediateEffects.selectCard({
                        mode: TargetMode.UpTo,
                        numCards: 2,
                        cardTypeFilter: WildcardCardType.Upgrade,
                        innerSystem: AbilityHelper.immediateEffects.defeat(),
                    }),
                    ['Ready a unit with 3 or less power']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card: UnitCard) => card.getPower() <= 3,
                        innerSystem: AbilityHelper.immediateEffects.ready()
                    }),
                    ['Deal 4 damage to a unit']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: 4 })
                    }),
                })
            })
        });
    }
}
