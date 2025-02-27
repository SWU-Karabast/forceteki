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
        this.addTriggeredAbility({
            title: 'If you control: a vigilance unit, heal 2 damage from a base, a command, give an Experience token to a unit, a aggression unit, deal 1 damage to a unit or base, a cunning unit, exhaust or ready a resource',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential(() => [
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isAspectInPlay(Aspect.Vigilance),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: CardType.Base,
                        innerSystem: AbilityHelper.immediateEffects.heal({ amount: 2 }),
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isAspectInPlay(Aspect.Command),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        innerSystem: AbilityHelper.immediateEffects.giveExperience()
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.source.controller.isAspectInPlay(Aspect.Aggression),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
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
                            ['Exhaust a resource']: AbilityHelper.immediateEffects.exhaustResources({ amount: 1 }),
                            ['Ready a resource']: AbilityHelper.immediateEffects.readyResources({ amount: 1 })
                        })
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
            ])
        });
    }
}
