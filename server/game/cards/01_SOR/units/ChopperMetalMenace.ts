import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class ChopperMetalMenace extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6208347478',
            internalName: 'chopper#metal-menace'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Discard a card from the defending player\'s deck. If the card is an event, exhaust a resource that player controls.',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 1,
                    target: context.source.activeAttack.target.controller
                })),
                AbilityHelper.immediateEffects.conditional((context) => ({
                    // There will be one event for the discard system overall plus one per card, so we need to ensure at least two exist
                    condition: context.events.length < 2 ? false : context.events[0].card.isEvent(),
                    onTrue: AbilityHelper.immediateEffects.exhaustResources({ amount: 1, target: context.source.activeAttack.target.controller }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }))
            ])
        });

        this.addConstantAbility({
            title: 'While you control another Spectre unit, Chopper gains Raid 1',
            condition: (context) => context.source.controller.getOtherUnitsInPlayWithTrait(context.source, Trait.Spectre).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}

ChopperMetalMenace.implemented = true;