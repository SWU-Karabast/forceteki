import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class DeathSpaceSkirmisher extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '1303370295',
            internalName: 'death-space-skirmisher'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Exhaust a unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => {
                        const spaceUnits = context.player.getUnitsInPlay(ZoneName.SpaceArena)
                            .filter((unit) => unit !== context.source);

                        return spaceUnits.length > 0;
                    },
                    onTrue: AbilityHelper.immediateEffects.exhaust(),
                })
            }
        });
    }
}
