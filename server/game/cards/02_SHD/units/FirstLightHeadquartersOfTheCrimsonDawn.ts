import AbilityHelper from '../../../AbilityHelper';
import { PlayUnitAction } from '../../../actions/PlayUnitAction';
import type { IPlayCardActionProperties } from '../../../core/ability/PlayCardAction';
import type { IPlayCardActionOverrides } from '../../../core/card/baseClasses/PlayableOrDeployableCard';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, PlayType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class FirstLightHeadquartersOfTheCrimsonDawn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4783554451',
            internalName: 'first-light#headquarters-of-the-crimson-dawn',
        };
    }

    protected override buildPlayCardActions(playType: PlayType = PlayType.PlayFromHand, propertyOverrides: IPlayCardActionOverrides = null) {
        const firstLightSmuggleAction = playType === PlayType.Smuggle
            ? [new FirstLightSmuggleAction(this)]
            : [];

        return super.buildPlayCardActions(playType, propertyOverrides).concat(firstLightSmuggleAction);
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each other friendly non-leader unit gains Grit',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.NonLeaderUnit,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}

class FirstLightSmuggleAction extends PlayUnitAction {
    private static generateProperties(properties: IPlayCardActionOverrides = {}): IPlayCardActionProperties {
        const damageCost = AbilityHelper.costs.dealDamage(4, {
            controller: RelativePlayer.Self,
            cardTypeFilter: WildcardCardType.Unit
        });

        return {
            title: 'Play First Light with Smuggle by dealing 4 damage to a friendly unit',
            ...properties,
            playType: PlayType.Smuggle,
            smuggleAspects: [Aspect.Vigilance, Aspect.Villainy],
            smuggleResourceCost: 7,
            additionalCosts: [damageCost],
            appendSmuggleToTitle: false
        };
    }

    public constructor(card: FirstLightHeadquartersOfTheCrimsonDawn, propertyOverrides: IPlayCardActionOverrides = {}) {
        super(card, FirstLightSmuggleAction.generateProperties(propertyOverrides));
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new FirstLightSmuggleAction(
            this.card,
            FirstLightSmuggleAction.generateProperties({
                ...this.createdWithProperties,
                ...overrideProperties
            })
        );
    }
}

FirstLightHeadquartersOfTheCrimsonDawn.implemented = true;
