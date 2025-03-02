import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, CardType, WildcardCardType } from '../../../core/Constants';

export default class SabinesMasterpieceCrazyColorful extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7325248681',
            internalName: 'sabines-masterpiece#crazy-colorful',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'If you control: a vigilance unit, heal 2 damage from a base, a command unit, give an Experience token to a unit, a aggression unit, deal 1 damage to a unit or base, a cunning unit, exhaust or ready a resource',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isAspectInPlay(Aspect.Vigilance),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Choose a base to heal 2 damage from',
                        cardTypeFilter: CardType.Base,
                        innerSystem: AbilityHelper.immediateEffects.heal({ amount: 2 }),
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isAspectInPlay(Aspect.Command),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Choose a unit to give an Experience token to',
                        cardTypeFilter: WildcardCardType.Unit,
                        innerSystem: AbilityHelper.immediateEffects.giveExperience()
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isAspectInPlay(Aspect.Aggression),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Choose a unit or base to deal 1 damage to',
                        cardTypeFilter: [CardType.Base, WildcardCardType.Unit],
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isAspectInPlay(Aspect.Cunning),
                    onTrue: AbilityHelper.immediateEffects.chooseModalEffects({
                        amountOfChoices: 1,
                        choices: () => ({
                            ['Exhaust a resource']: AbilityHelper.immediateEffects.selectPlayer({
                                innerSystem: AbilityHelper.immediateEffects.exhaustResources({ amount: 1 }),
                            }),
                            ['Ready a resource']: AbilityHelper.immediateEffects.selectPlayer({
                                innerSystem: AbilityHelper.immediateEffects.readyResources({ amount: 1 }),
                            }),
                        })
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
            ])
        });
    }
}
