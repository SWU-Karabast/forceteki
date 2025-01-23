import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';


export default class C3POProtocolDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8009713136',
            internalName: 'c3po#protocol-droid',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Choose a number',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: Array.from({ length: 21 }, (x, i) => `${i}`),  // array of strings from 0 to 20
                condition: (context) => context.source.controller.drawDeck.length > 0   // skip ability if deck is empty
            },
            then: (thenContext) => ({
                title: 'Look at the top card of your deck',
                thenCondition: (context) => context.source.controller.drawDeck.length > 0,   // skip ability if deck is empty
                immediateEffect: AbilityHelper.immediateEffects.lookAt(
                    (context) => ({ target: context.source.controller.getTopCardOfDeck() })
                ),
                then: {
                    title: `Reveal and draw ${thenContext.source.controller.getTopCardOfDeck()?.title} from the top of your deck`,
                    optional: true,
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (context) => parseInt(thenContext.select) === context.source.controller.getTopCardOfDeck()?.printedCost,
                        onTrue: AbilityHelper.immediateEffects.simultaneous([
                            AbilityHelper.immediateEffects.reveal((context) => ({ target: context.source.controller.getTopCardOfDeck() })),
                            AbilityHelper.immediateEffects.draw()
                        ]),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    })
                }
            })
        });
    }
}

C3POProtocolDroid.implemented = true;
