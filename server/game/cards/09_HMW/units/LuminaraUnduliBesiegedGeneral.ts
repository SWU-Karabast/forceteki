import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class LuminaraUnduliBesiegedGeneral extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'luminara-unduli#besieged-general-id',
            internalName: 'luminara-unduli#besieged-general',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Attack with a unit. It gets +2/+0 for this attack',
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player
            },
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) }
                })
            }
        });
    }
}