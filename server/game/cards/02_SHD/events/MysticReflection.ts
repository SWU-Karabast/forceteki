import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class MysticReflection extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9999079491',
            internalName: 'mystic-reflection',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Give an enemy unit –2/–0 for this phase. If you control a Force unit, give the enemy unit –2/–2 for this phase instead.',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.isTraitInPlay(Trait.Force),
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
