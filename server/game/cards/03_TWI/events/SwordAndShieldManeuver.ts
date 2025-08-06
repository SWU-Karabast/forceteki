import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, Trait } from '../../../core/Constants';

export default class SwordAndShieldManeuver extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8719468890',
            internalName: 'sword-and-shield-maneuver'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give each friendly Trooper unit Raid 1 for this phase. Give each friendly Jedi unit Sentinel for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 }),
                    target: context.player.getArenaUnits({ trait: Trait.Trooper })
                })),
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel }),
                    target: context.player.getArenaUnits({ trait: Trait.Jedi })
                }))
            ])
        });
    }
}
