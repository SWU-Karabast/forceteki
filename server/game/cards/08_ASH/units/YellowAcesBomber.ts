import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class YellowAcesBomber extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6234240452',
            internalName: 'yellow-aces-bomber'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 2 damage to a base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.isUpgraded(),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            },
        });
    }
}
