import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class ForceLightning extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2639435822',
            internalName: 'force-lightning',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Choose a unit. It loses all abilities for this phase.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.loseAllAbilities()
                })
            },
            then: (thenContext) => ({
                title: 'Pay any number of resources. Deal 2 damage to that unit for each resource paid.',
                thenCondition: (context) =>
                    context.player.isTraitInPlay(Trait.Force) &&
                    context.player.readyResourceCount > 0,
                targetResolver: {
                    mode: TargetMode.DropdownList,
                    options: (context) => Array.from({ length: context.player.readyResourceCount + 1 }, (_x, i) => `${i}`),
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.payResourceCost((context) => ({
                            amount: parseInt(context.select),
                            target: context.player,
                        })),
                        AbilityHelper.immediateEffects.damage((context) => ({
                            amount: parseInt(context.select) * 2,
                            target: thenContext.target
                        }))
                    ]),
                },
            })
        });
    }
}
