import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, Trait, WildcardCardType } from '../../../core/Constants';

export default class Clone extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0345124206',
            internalName: 'clone',
        };
    }

    public override setupCardAbilities(sourceCard: this) {
        const ability = this.createTriggeredAbility<this>({
            title: 'This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique',
            optional: true,
            when: {
                onUnitEntersPlay: (event, context) => event.card === context.source,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, context) => !card.hasSomeTrait(Trait.Vehicle) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.whileSourceInPlayCardEffect((context) => ({
                        target: context.source,
                        effect: AbilityHelper.ongoingEffects.overridePrintedAttributes({
                            printedHp: context.target.getPrintedHp(),
                            printedPower: context.target.getPrintedPower(),
                        }),
                    })),
                    AbilityHelper.immediateEffects.handler({
                        handler: (context) => context.target.setupCardAbilities(context.source)
                    }),
                ])
            },
        });

        this.game.on(EventName.OnUnitEntersPlay, (event) => {
            if (event.card === sourceCard) {
                this.game.resolveAbility(ability.createContext(event.context.player, event));
            }
        });
    }
}
