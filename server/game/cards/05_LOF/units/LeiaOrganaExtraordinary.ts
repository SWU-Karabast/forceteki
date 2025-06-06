import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, AbilityType, Aspect, ZoneName } from '../../../core/Constants';

export default class LeiaOrganaExtraordinary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'leia-organa#extraordinary-id',
            internalName: 'leia-organa#extraordinary',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While this unit is in the space arena, she can\'t ready and gains "Action [use the Force]: Move this unit to the ground arena and give each friendly Heroism unit +2/+2 for this phase"',
            condition: (context) => context.source.zoneName === ZoneName.SpaceArena,
            ongoingEffect: [
                AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready),
                AbilityHelper.ongoingEffects.gainAbility({
                    title: 'Move this unit to the ground arena and give each friendly Heroism unit +2/+2 for this phase',
                    type: AbilityType.Action,
                    cost: AbilityHelper.costs.useTheForce,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                            target: context.player.getArenaUnits({ aspect: Aspect.Heroism }),
                            effect: AbilityHelper.ongoingEffects.modifyStats({
                                power: 2,
                                hp: 2
                            })
                        })),
                        AbilityHelper.immediateEffects.moveUnitFromSpaceToGround()
                    ])
                })
            ],
        });
    }
}