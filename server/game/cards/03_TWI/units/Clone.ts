import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { CardAbility } from '../../../core/ability/CardAbility';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, Duration, Trait, WildcardCardType } from '../../../core/Constants';
import type Game from '../../../core/Game';
import type { IAbilityPropsWithSystems } from '../../../Interfaces';

export default class Clone extends NonLeaderUnitCard {
    protected override overrideNotImplemented = true;

    protected override getImplementationId() {
        return {
            id: '0345124206',
            internalName: 'clone',
        };
    }

    public override preEnterPlayEffect(event: any): void {
        const cloneAbility = new CloneAbility(event.context.game, event.card, {
            title: 'This unit enter play as a copy of a non-leader, non-Vehicle unit in play, except it gains the Clone trait and is not unique',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, context) => !card.hasSomeTrait(Trait.Vehicle) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                    duration: Duration.Custom,
                    until: {
                        onCardLeavesPlay: (event, context) => event.card === context.source,
                    },
                    target: context.source,
                    effect: [
                        AbilityHelper.ongoingEffects.overridePrintedAttributes({
                            title: context.target.title,
                            subtitle: context.target.subtitle,
                            aspects: context.target.aspects,
                            defaultArena: context.target.defaultArena,
                            printedType: context.target.printedType,
                            printedCost: context.target.printedCost,
                            printedHp: context.target.getPrintedHp(),
                            printedPower: context.target.getPrintedPower(),
                            printedTraits: context.target.getPrintedTraits(),
                        }),
                        AbilityHelper.ongoingEffects.gainTrait(Trait.Clone),
                    ]
                })),
            },
        });

        event.context.game.resolveAbility(cloneAbility.createContext(event.context.player, event));
    }
}

class CloneAbility extends CardAbility {
    public constructor(game: Game, card: Card, properties: IAbilityPropsWithSystems<AbilityContext<Card>>) {
        super(game, card, properties, AbilityType.Triggered);
    }
}