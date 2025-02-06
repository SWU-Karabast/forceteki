import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class RelentlessPursuit extends EventCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId() {
        return {
            id: '5778949819',
            internalName: 'relentless-pursuit',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a friendly unit. It captures an enemy non-leader unit that costs the same as or less than it. If the friendly unit is a Bounty Hunter, give a Shield token to it.',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.targets.friendlyUnit.hasSomeTrait(Trait.BountyHunter),
                        onTrue: AbilityHelper.immediateEffects.giveShield(),
                        onFalse: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
                    })
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card, context) => card.isNonLeaderUnit() && card.cost <= context.targets.friendlyUnit.cost,
                    immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                        captor: context.targets.friendlyUnit
                    }))
                }
            }
        });
    }
}
