import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class ChimaeraAFrighteningReality extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chimaera#a-frightening-reality-id',
            internalName: 'chimaera#a-frightening-reality',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Choose a friendly unit and an enemy non-leader unit. If you do, defeat those units',
            optional: true,
            targetResolvers: {
                friendlyUnits: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                },
                enemyUnits: {
                    dependsOn: 'friendlyUnits',
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: abilityHelper.immediateEffects.defeat((context) => ({ target: [context.targets.friendlyUnits, context.targets.enemyUnits] }))
                },
            },
        });

        registrar.addTriggeredAbility({
            title: 'Heal 2 damage from your base',
            when: {
                onCardDefeated: (event, context) => EnumHelpers.isUnit(event.lastKnownInformation.type) && event.lastKnownInformation.controller !== context.player
            },
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
        });
    }
}