import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Aspect, PlayType, WildcardCardType } from '../../../core/Constants';
import { PlayEventAction } from '../../../actions/PlayEventAction';
import type { IPlayCardActionProperties } from '../../../core/ability/PlayCardAction';
import { CostAdjuster, CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { IPlayCardActionOverrides } from '../../../core/card/baseClasses/PlayableOrDeployableCard';

export default class Bamboozle extends EventCard {
    protected override getImplementationId() {
        return {
            id: '9644107128',
            internalName: 'bamboozle',
        };
    }

    protected override buildPlayCardActions(playType: PlayType = PlayType.PlayFromHand, propertyOverrides: IPlayCardActionOverrides = null) {
        const bamboozleAction = playType === PlayType.Smuggle || playType === PlayType.Piloting
            ? []
            : [new PlayBamboozleAction(this, { playType }, this.game.abilityHelper)];

        return super.buildPlayCardActions(playType, propertyOverrides).concat(bamboozleAction);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a unit and return each upgrade on it to its owner\'s hand',
            cannotTargetFirst: true,
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
    private abilityHelper: IAbilityHelper;

    private static generateProperties(card: Bamboozle, properties: IPlayCardActionProperties, AbilityHelper: IAbilityHelper) {
        const discardCost = AbilityHelper.costs.discardCardFromOwnHand({ cardCondition: (c) => c !== card && c.hasSomeAspect(Aspect.Cunning) });

        return {
            title: 'Play Bamboozle by discarding a Cunning card',
            costAdjusters: new CostAdjuster(card.game, card, { costAdjustType: CostAdjustType.Free }),
            additionalCosts: [discardCost],
            ...properties,
        };
    }

    public constructor(card: Bamboozle, properties: IPlayCardActionProperties, AbilityHelper: IAbilityHelper) {
        super(card.game, card, PlayBamboozleAction.generateProperties(card, properties, AbilityHelper));
        this.abilityHelper = AbilityHelper;
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new PlayBamboozleAction(
            this.card as Bamboozle,
            PlayBamboozleAction.generateProperties(this.card as Bamboozle,
                {
                    ...this.createdWithProperties,
                    ...overrideProperties
                }, this.abilityHelper)
            , this.abilityHelper);
    }
}
