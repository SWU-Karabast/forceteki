import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class ReliefFrigate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'relief-frigate-id',
            internalName: 'relief-frigate',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 3 damage from a base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                    amount: 3 * context.game.getPlayers().map((x) => x.base)
                        .filter((x) => x !== context.target).length
                }))
            }
        });
    }
}