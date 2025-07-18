import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class DeathSpaceSkirmisher extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1303370295',
            internalName: 'death-space-skirmisher'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust a unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => {
                        const spaceUnits = context.player.getArenaUnits({ arena: ZoneName.SpaceArena })
                            .filter((unit) => unit !== context.source);

                        return spaceUnits.length > 0;
                    },
                    onTrue: AbilityHelper.immediateEffects.exhaust(),
                })
            }
        });
    }
}
