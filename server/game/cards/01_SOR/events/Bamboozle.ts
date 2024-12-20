import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { Aspect, EffectName, WildcardCardType } from '../../../core/Constants';
import { PlayEventAction } from '../../../actions/PlayEventAction';
import { IPlayCardActionProperties } from '../../../core/ability/PlayCardAction';
import Player from '../../../core/Player';

export default class Bamboozle extends EventCard {
    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        this.defaultActions.push(new PlayBamboozleAction({ card: this }));
    }

    protected override getImplementationId() {
        return {
            id: '9644107128',
            internalName: 'bamboozle',
        };
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
    public constructor(properties: IPlayCardActionProperties) {
        super({ ...properties, title: 'Play Bamboozle by discarding a Cunning card' });
    }

    public override getCosts(context): any {
        const costs = [AbilityHelper.costs.discardCardFromOwnHand({ cardCondition: (c) => c !== context.source && c.hasSomeAspect(Aspect.Cunning) })];

        if (context.player.hasOngoingEffect(EffectName.AdditionalPlayCost)) {
            const additionalPlayCosts = context.player
                .getOngoingEffectValues(EffectName.AdditionalPlayCost)
                .map((effect) => effect(context))
                // filter out any undefined or null cost
                .filter((cost) => cost);
            return costs.concat(additionalPlayCosts);
        }
        return costs;
    }

    public override clone(overrideProperties: IPlayCardActionProperties) {
        return new PlayBamboozleAction({ ...this.createdWithProperties, ...overrideProperties });
    }
}

Bamboozle.implemented = true;
