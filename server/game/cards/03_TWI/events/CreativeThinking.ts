import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class CreativeThinking extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0328412140',
            internalName: 'creative-thinking',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Exhaust a non-unique unit. Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card) => !card.unique && card.canBeExhausted() && !card.exhausted,
                    innerSystem: AbilityHelper.immediateEffects.exhaust(),
                }),
                AbilityHelper.immediateEffects.createCloneTrooper((context) => ({ target: context.source.controller })),
            ])
        });
    }
}

CreativeThinking.implemented = true;
