import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class WhirlwindOfPower extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1655929166',
            internalName: 'whirlwind-of-power',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Give a unit –2/–2 for this phase. If you control a Force unit, give it –3/–3 instead.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.isTraitInPlay(Trait.Force),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -3 })
                    }),
                    onFalse: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
                    })
                })
            }
        });
    }
}