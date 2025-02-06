import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class PrisonerOfWar extends EventCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId() {
        return {
            id: '3799780905',
            internalName: 'prisoner-of-war',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'A friendly unit captures an enemy non-leader, non-Vehicle unit. If the enemy unit costs less than the friendly unit, create 2 Battle Droid tokens.',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card, context) => card.isNonLeaderUnit() && !card.hasSomeTrait(Trait.Vehicle),
                    immediateEffect: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.capture((context) => ({
                            captor: context.targets.friendlyUnit
                        })),
                        AbilityHelper.immediateEffects.conditional({
                            condition: (context) => context.targets.captureUnit.cost < context.targets.friendlyUnit.cost,
                            onTrue: AbilityHelper.immediateEffects.createBattleDroid((context) => ({
                                target: context.targets.friendlyUnit.controller,
                                amount: 2
                            })),
                            onFalse: AbilityHelper.immediateEffects.noAction(),
                        })
                    ])
                }
            }
        });
    }
}
