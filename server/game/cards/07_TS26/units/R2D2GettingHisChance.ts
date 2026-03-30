import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class R2D2GettingHisChance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'r2d2#getting-his-chance-id',
            internalName: 'r2d2#getting-his-chance',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to a base. If you do, that base\'s controller draws a card',
            optional: true,
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'That base\'s controller draws a card',
                immediateEffect: abilityHelper.immediateEffects.draw({
                    target: ifYouDoContext.target.controller,
                })
            })
        });
    }
}