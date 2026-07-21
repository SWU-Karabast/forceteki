import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class HeroesOnBothSides extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5610901450',
            internalName: 'heroes-on-both-sides'
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Give each chosen unit +2/+2 and ${TextHelper.Saboteur} for this phase`,
            targetResolvers: {
                republicUnit: {
                    activePromptTitle: `Choose a ${TextHelper.Trait.Republic} unit`,
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
                    activePromptTitle: `Choose a ${TextHelper.Trait.Separatist} unit`,
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
