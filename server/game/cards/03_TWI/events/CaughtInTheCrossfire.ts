import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class CaughtInTheCrossfire extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5013139687',
            internalName: 'caught-in-the-crossfire',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose 2 enemy units in the same arena. Each of those units deals damage equal to its power to the other.',
            targetResolvers: {
                firstUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Opponent,
                },
                secondUnit: {
                    dependsOn: 'firstUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card, context) => card.zone === context.targets.firstUnit.zone && card !== context.targets.firstUnit,
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.damage((context) => ({
                            source: context.targets.firstUnit,
                            amount: context.targets.firstUnit.getPower(),
                            target: context.targets.secondUnit,
                        })),
                        AbilityHelper.immediateEffects.damage((context) => ({
                            source: context.targets.secondUnit,
                            amount: context.targets.secondUnit.getPower(),
                            target: context.targets.firstUnit,
                        })),
                    ])
                }
            }
        });
    }
}

CaughtInTheCrossfire.implemented = true;
