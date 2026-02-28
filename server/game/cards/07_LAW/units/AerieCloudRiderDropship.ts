import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CardType, RelativePlayer, ZoneName } from '../../../core/Constants';

export default class AerieCloudRiderDropship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0475417545',
            internalName: 'aerie#cloudrider-dropship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 2 damage to an enemy ground unit and 2 damage to a base',
            targetResolvers: {
                unit: {
                    activePromptTitle: 'Select an enemy ground unit to deal 2 damage to',
                    zoneFilter: ZoneName.GroundArena,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                },
                base: {
                    activePromptTitle: 'Select a base to deal 2 damage to',
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            }
        });
    }
}