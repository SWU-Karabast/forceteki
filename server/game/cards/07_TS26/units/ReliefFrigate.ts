import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class ReliefFrigate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9458579327',
            internalName: 'relief-frigate',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Choose a base. Heal 3 damage from each other base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                    amount: 3,
                    target: context.game.getPlayers().map((x) => x.base)
                        .filter((x) => x !== context.target)
                }))
            }
        });
    }
}