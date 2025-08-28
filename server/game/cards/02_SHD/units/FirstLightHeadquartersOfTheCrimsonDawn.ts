import type { IAbilityHelper } from '../../../AbilityHelper';
import { PlayUnitAction } from '../../../actions/PlayUnitAction';
import type { IPlayCardActionProperties } from '../../../core/ability/PlayCardAction';
import type { IPlayCardActionOverrides } from '../../../core/card/baseClasses/PlayableOrDeployableCard';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName, PlayType, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import { GameObjectBase } from '../../../core/GameObjectBase';

export default class FirstLightHeadquartersOfTheCrimsonDawn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4783554451',
            internalName: 'first-light#headquarters-of-the-crimson-dawn',
        };
    }

    protected override buildPlayCardActions(playType: PlayType = PlayType.PlayFromHand, propertyOverrides: IPlayCardActionOverrides = null) {
        const firstLightSmuggleAction = playType === PlayType.Smuggle
            ? [GameObjectBase.createWithoutRefs(() => new FirstLightSmuggleAction(this.game.abilityHelper, this))]
            : [];

        return super.buildPlayCardActions(playType, propertyOverrides).concat(firstLightSmuggleAction);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly non-leader unit gains Grit',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.NonLeaderUnit,
            matchTarget: (card, context) => card !== context.source,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Grit)
        });
    }
}

class FirstLightSmuggleAction extends PlayUnitAction {
    private abilityHelper: IAbilityHelper;

    private static generateProperties(AbilityHelper: IAbilityHelper, properties: IPlayCardActionOverrides = {}): IPlayCardActionProperties {
        const damageCost = AbilityHelper.costs.dealDamage(4, {
            controller: RelativePlayer.Self,
            cardTypeFilter: WildcardCardType.Unit
        });

        return {
            title: 'Play First Light with Smuggle by dealing 4 damage to a friendly unit',
            ...properties,
            playType: PlayType.Smuggle,
            alternatePlayActionAspects: [Aspect.Vigilance, Aspect.Villainy],
            alternatePlayActionResourceCost: 7,
            additionalCosts: [damageCost],
            appendAlternatePlayActionKeywordToTitle: false
        };
    }

    public constructor(AbilityHelper: IAbilityHelper, card: FirstLightHeadquartersOfTheCrimsonDawn, propertyOverrides: IPlayCardActionOverrides = {}) {
        super(card.game, card, FirstLightSmuggleAction.generateProperties(AbilityHelper, propertyOverrides));
        this.abilityHelper = AbilityHelper;
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new FirstLightSmuggleAction(
            this.abilityHelper,
            this.card as FirstLightHeadquartersOfTheCrimsonDawn,
            FirstLightSmuggleAction.generateProperties(this.abilityHelper, {
                ...this.createdWithProperties,
                ...overrideProperties
            })
        );
    }
}
