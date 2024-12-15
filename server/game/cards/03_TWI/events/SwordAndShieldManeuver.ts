import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { KeywordName, Trait } from '../../../core/Constants';
import { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class SwordAndShieldManeuver extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8719468890',
            internalName: 'sword-and-shield-maneuver'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give each friendly Trooper unit Raid 1 for this phase. Give each friendly Jedi unit Sentinel for this phase.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 }),
                    target: context.source.controller.getUnitsInPlayWithTrait(Trait.Trooper)
                })),
                AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel }),
                    target: context.source.controller.getUnitsInPlayWithTrait(Trait.Jedi)
                }))
            ])
        });
    }
}

SwordAndShieldManeuver.implemented = true;
