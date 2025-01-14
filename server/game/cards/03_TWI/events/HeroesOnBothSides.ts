import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { KeywordName, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class HeroesOnBothSides extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5610901450',
            internalName: 'heroes-on-both-sides'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Give each chosen unit +2/+2 and Saboteur for this phase',
            targetResolvers: {
                republicUnit: {
                    activePromptTitle: 'Choose a Republic unit',
                    mode: TargetMode.Exactly,
                    numCards: 1,
                    canChooseNoCards: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Republic),
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: [
                            AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 }),
                            AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur),
                        ]
                    })
                },
                separatistUnit: {
                    activePromptTitle: 'Choose a Separatist unit',
                    mode: TargetMode.Exactly,
                    numCards: 1,
                    canChooseNoCards: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.hasSomeTrait(Trait.Separatist),
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: [
                            AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 }),
                            AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur),
                        ]
                    })
                },
            },
        });
    }
}

HeroesOnBothSides.implemented = true;
