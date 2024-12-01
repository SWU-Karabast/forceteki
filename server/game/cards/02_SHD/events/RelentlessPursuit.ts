import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class RelentlessPursuit extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5778949819',
            internalName: 'relentless-pursuit',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a friendly unit. If the friendly unit is a Bounty Hunter, give a Shield token to it.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.target.hasSomeTrait(Trait.BountyHunter),
                    onTrue: AbilityHelper.immediateEffects.giveShield(),
                    onFalse: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true }),
                })
            },
            then: (thenContext) => ({
                title: 'It captures an enemy non-leader unit that costs the same as or less than it.',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= thenContext.target.cost,
                    immediateEffect: AbilityHelper.immediateEffects.capture({
                        captor: thenContext.target
                    })
                }
            })
        });
    }
}

RelentlessPursuit.implemented = true;
