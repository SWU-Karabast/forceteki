import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Aspect, EffectName, WildcardCardType } from '../../../core/Constants';
import { PlayEventAction } from '../../../actions/PlayEventAction';
import { IPlayCardActionProperties } from '../../../core/ability/PlayCardAction';
import { CostAdjuster, CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class Bamboozle extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9644107128',
            internalName: 'bamboozle',
        };
    }

    public override getActions() {
        return super.getActions().concat(new PlayBamboozleAction({ card: this }));
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat an upgrade',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.exhaust(),
                    AbilityHelper.immediateEffects.returnToHand((context) => ({
                        target: context.target.upgrades
                    }))
                ])
            }
        });
    }
}

class PlayBamboozleAction extends PlayEventAction {
    private static generateProperties(properties: IPlayCardActionProperties) {
        const card = properties.card;
        const discardCost = AbilityHelper.costs.discardCardFromOwnHand({ cardCondition: (c) => c !== card && c.hasSomeAspect(Aspect.Cunning) });

        return {
            title: 'Play Bamboozle by discarding a Cunning card',
            costAdjusters: new CostAdjuster(card.game, card, { costAdjustType: CostAdjustType.Free }),
            additionalCosts: [discardCost],
            ...properties,
        };
    }

    public constructor(properties: IPlayCardActionProperties) {
        super(PlayBamboozleAction.generateProperties(properties));
    }

    public override clone(overrideProperties: IPlayCardActionProperties) {
        return new PlayBamboozleAction(PlayBamboozleAction.generateProperties({
            ...this.createdWithProperties,
            ...overrideProperties
        }));
    }
}

Bamboozle.implemented = true;
