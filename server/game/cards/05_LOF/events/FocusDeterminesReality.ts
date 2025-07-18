import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, Trait } from '../../../core/Constants';

export default class FocusDeterminesReality extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8743459187',
            internalName: 'focus-determines-reality',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Each friendly Force unit gains Raid 1 and Saboteur for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 }),
                    target: context.player.getArenaUnits({ trait: Trait.Force })
                })),
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Saboteur }),
                    target: context.player.getArenaUnits({ trait: Trait.Force })
                }))
            ])
        });
    }
}