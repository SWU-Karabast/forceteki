import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class MysticReflection extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9999079491',
            internalName: 'mystic-reflection',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give an enemy unit –2/–0 for this phase. If you control a Force unit, give the enemy unit –2/–2 for this phase instead.',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isTraitInPlay(Trait.Force),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                    }),
                    onFalse: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
                    }),
                })
            }
        });
    }
}
