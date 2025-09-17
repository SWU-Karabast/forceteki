import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class BoKatanKryzeAlone extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'bokatan-kryze#alone-id',
            internalName: 'bokatan-kryze#alone',
        };
    }

    public override setupCardAbilities(
        registrar: INonLeaderUnitAbilityRegistrar,
        abilityHelper: IAbilityHelper,
    ) {
        registrar.addTriggeredAbility({
            title: 'Give an Experience token to a friendly unit',
            when: {
                // only enemy units
                onCardDefeated: (event, context) => EnumHelpers.isUnit(event.lastKnownInformation.type) && event.lastKnownInformation.controller !== context.player
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });

        registrar.addWhenPlayedAbility({
            title: 'Give each enemy unit -3/-3 for this phase',
            immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.source.controller.opponent.getArenaUnits(),
                effect: abilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -3 })
            })),
        });
    }
}
