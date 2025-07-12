import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class BD1BeepBooBooBweep extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0024409893',
            internalName: 'bd1#beep-boo-boo-bweep'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Choose another friendly unit. While this unit is in play, the chosen unit gets +1/+0 and gains Saboteur.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
                    effect: [
                        AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                        AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
                    ]
                })
            }
        });
    }
}
