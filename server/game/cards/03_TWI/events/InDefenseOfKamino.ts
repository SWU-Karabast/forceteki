import AbilityHelper from '../../../AbilityHelper';
import { AbilityType, KeywordName, Trait, WildcardZoneName } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';

export default class InDefenseOfKamino extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1272825113',
            internalName: 'in-defense-of-kamino',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'For this phase, each friendly Republic unit gains Restore 2 and: "When Defeated: Create a Clone Trooper token."',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: [
                    AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 }),
                    AbilityHelper.ongoingEffects.gainAbility({
                        type: AbilityType.Triggered,
                        title: 'Create a Clone Trooper token.',
                        when: { onCardDefeated: (event, context) => event.card === context.source },
                        immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
                    })
                ],
                target: context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena, (card) => card.hasSomeTrait(Trait.Republic))
            }))
        });
    }
}

InDefenseOfKamino.implemented = true;