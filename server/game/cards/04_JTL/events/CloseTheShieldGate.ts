import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { AbilityType, CardType } from '../../../core/Constants';

export default class CloseTheShieldGate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8736422150',
            internalName: 'close-the-shield-gate',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'Prevent the next damage that would be dealt to this base',
                        type: AbilityType.ReplacementEffect,
                        when: {
                            onDamageDealt: (event, context) => event.card === context.source
                        },
                        effect: 'Prevent the damage',
                        replaceWith: {
                            replacementImmediateEffect: AbilityHelper.immediateEffects.conditional({
                                condition: () => context.events[0].isIndirect,
                                onTrue: AbilityHelper.immediateEffects.noAction(), // TODO: original indirect damage system goes here
                                onFalse: AbilityHelper.immediateEffects.noAction()
                            })
                        },
                    })
                }))
            }
        });
    }
}
