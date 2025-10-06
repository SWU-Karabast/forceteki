import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class ZitonMojBlackSunBully extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ziton-moj#black-sun-bully-id',
            internalName: 'ziton-moj#black-sun-bully',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to a base',
            when: {
                onClaimInitiative: (event, context) => event.player === context.player,
            },
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 }),
            },
        });
    }
}
