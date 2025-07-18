import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class Aggression extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3736081333',
            internalName: 'aggression',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Aggression modal ability:',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 2,
                choices: () => ({
                    ['Draw a card']: AbilityHelper.immediateEffects.draw(),
                    ['Defeat up to 2 upgrades']: AbilityHelper.immediateEffects.selectCard({
                        mode: TargetMode.UpTo,
                        numCards: 2,
                        cardTypeFilter: WildcardCardType.Upgrade,
                        immediateEffect: AbilityHelper.immediateEffects.defeat(),
                    }),
                    ['Ready a unit with 3 or less power']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card: IUnitCard) => card.getPower() <= 3,
                        immediateEffect: AbilityHelper.immediateEffects.ready()
                    }),
                    ['Deal 4 damage to a unit']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 4 })
                    }),
                })
            })
        });
    }
}
