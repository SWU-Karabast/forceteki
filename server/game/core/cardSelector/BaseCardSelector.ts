import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import type { CardTypeFilter, RelativePlayerFilter, TargetMode, ZoneFilter } from '../Constants';
import { ZoneName, RelativePlayer, WildcardZoneName, WildcardRelativePlayer, WildcardCardType, CardType } from '../Constants';
import type Game from '../Game';
import type { Player } from '../Player';
import * as Contract from '../utils/Contract';
import * as EnumHelpers from '../utils/EnumHelpers';
import * as Helpers from '../utils/Helpers';

export interface IBaseCardSelectorProperties<TContext> {
    mode: Extract<TargetMode, TargetMode.AutoSingle | TargetMode.BetweenVariable | TargetMode.Exactly | TargetMode.ExactlyVariable | TargetMode.MaxStat | TargetMode.Single | TargetMode.Unlimited | TargetMode.UpTo | TargetMode.UpToVariable>;
    cardCondition?: (card: Card, context: TContext) => boolean;
    multiSelectCardCondition?: (card: Card, selectedCards: Card[], context: TContext) => boolean;
    cardTypeFilter?: CardTypeFilter | CardTypeFilter[];
    optional?: boolean;
    zoneFilter?: ZoneFilter | ZoneFilter[];
    capturedByFilter?: Card | Card[] | ((context: TContext) => Card | Card[]);
    controller?: ((context: TContext) => RelativePlayerFilter) | RelativePlayerFilter;
    checkTarget?: boolean;
    appendToDefaultTitle?: string;
}

export abstract class BaseCardSelector<TContext extends AbilityContext> {
    public cardCondition: (card: Card, context: TContext) => boolean;
    public multiSelectCardCondition?: (card: Card, selectedCards: Card[], context: TContext) => boolean;
    public cardTypeFilter: CardTypeFilter[];
    public optional: boolean;
    public zoneFilter: ZoneFilter[];
    public capturedByFilter?: Card | Card[] | ((context: TContext) => Card | Card[]);
    public controller: ((context: TContext) => RelativePlayerFilter) | RelativePlayerFilter;
    public checkTarget: boolean;
    public appendToDefaultTitle?: string;

    public static cardTypeFilterDescription(cardTypeFilter: CardTypeFilter | CardTypeFilter[], plural: boolean): { description: string; article: string } {
        const filters: string[] = [];
        let article = 'a';
        const fallback = { description: plural ? 'cards' : 'card', article: 'a' };

        for (const filter of Helpers.asArray(cardTypeFilter)) {
            switch (filter) {
                case CardType.BasicUnit:
                case WildcardCardType.Unit:
                    filters.push(plural ? 'units' : 'unit');
                    break;
                case CardType.BasicUpgrade:
                case WildcardCardType.Upgrade:
                    filters.push(plural ? 'upgrades' : 'upgrade');
                    if (filters.length === 1) {
                        article = 'an';
                    }
                    break;
                case WildcardCardType.UnitUpgrade:
                    filters.push(plural ? 'unit upgrades' : 'unit upgrade');
                    break;
                case WildcardCardType.NonLeaderUnit:
                    filters.push(plural ? 'non-leader units' : 'non-leader unit');
                    break;
                case WildcardCardType.NonLeaderUpgrade:
                    filters.push(plural ? 'non-leader upgrades' : 'non-leader upgrade');
                    break;
                case WildcardCardType.NonUnit:
                    filters.push(plural ? 'non-units' : 'non-unit');
                    break;
                case CardType.Base:
                    filters.push(plural ? 'bases' : 'base');
                    break;
                case CardType.Event:
                    filters.push(plural ? 'events' : 'event');
                    if (filters.length === 1) {
                        article = 'an';
                    }
                    break;
                case CardType.Leader:
                    filters.push(plural ? 'leaders' : 'leader');
                    break;
                case CardType.LeaderUnit:
                    filters.push(plural ? 'leader units' : 'leader unit');
                    break;
                default:
                    return fallback;
            }
        }

        if (filters.length === 0) {
            return fallback;
        }

        let description = filters[0];
        for (let i = 1; i < filters.length; i++) {
            description += i < filters.length - 1 ? ', '
                : filters.length === 2 ? ' or '
                    : ', or ';
            description += filters[i];
        }
        return { description, article };
    }

    public constructor(properties: IBaseCardSelectorProperties<TContext>) {
        this.cardCondition = properties.cardCondition ?? (() => true);
        this.multiSelectCardCondition = properties.multiSelectCardCondition;
        this.optional = properties.optional ?? false;
        this.zoneFilter = this.buildZoneFilter(properties.zoneFilter);
        this.capturedByFilter = properties.capturedByFilter;
        this.controller = properties.controller || WildcardRelativePlayer.Any;
        this.checkTarget = !!properties.checkTarget;
        this.appendToDefaultTitle = properties.appendToDefaultTitle;
        this.cardTypeFilter = properties.cardTypeFilter ? Helpers.asArray(properties.cardTypeFilter) : [WildcardCardType.Any];
    }

    public get hasAnyCardFilter() {
        return !!this.cardTypeFilter || !!this.cardCondition || !!this.multiSelectCardCondition;
    }

    protected buildZoneFilter(property?: ZoneFilter | ZoneFilter[]) {
        const zoneFilter = property || WildcardZoneName.AnyAttackable || [];
        if (!Array.isArray(zoneFilter)) {
            return [zoneFilter];
        }
        return zoneFilter;
    }

    public findPossibleCards(context: TContext) {
        const controller = Helpers.derive(this.controller, context);

        if (this.zoneFilter.includes(WildcardZoneName.Any)) {
            if (controller === RelativePlayer.Self) {
                return context.game.allCards.filter((card) => card.controller === context.player);
            } else if (controller === RelativePlayer.Opponent) {
                return context.game.allCards.filter((card) => card.controller === context.player.opponent);
            }
            return context.game.allCards;
        }

        let possibleCards: Card[] = [];
        if (controller !== RelativePlayer.Opponent) {
            possibleCards = this.zoneFilter.reduce(
                (array, zoneFilter) => array.concat(this.getCardsForPlayerZones(zoneFilter, context.player, context.game)), possibleCards
            );
        }
        if (controller !== RelativePlayer.Self && context.player.opponent) {
            possibleCards = this.zoneFilter.reduce(
                (array, zoneFilter) => array.concat(this.getCardsForPlayerZones(zoneFilter, context.player.opponent, context.game)), possibleCards
            );
        }

        possibleCards = this.filterCaptureZones(possibleCards, context);

        return possibleCards;
    }

    protected filterCaptureZones(possibleCards: Card[], context: TContext) {
        // get cards from capture zones, if any
        const concreteCaptors = Helpers.asArray(
            typeof this.capturedByFilter === 'function'
                ? this.capturedByFilter(context)
                : this.capturedByFilter
        );

        if (concreteCaptors.length === 0) {
            return possibleCards;
        }

        if (!this.zoneFilter.includes(ZoneName.Capture)) {
            Contract.fail('Cannot use the \'capturedByFilter\' property without specifying \'ZoneName.Capture\' in the zoneFilter');
        }

        for (const captor of concreteCaptors) {
            Contract.assertTrue(captor.isUnit(), `Attempting to target capture zone for ${captor.internalName} but it is not a unit`);
            Contract.assertTrue(captor.isInPlay(), `Attempting to target capture zone for ${captor.internalName} but it is in non-play zone ${captor.zoneName}`);
        }

        return possibleCards.filter((card) => card.zoneName !== ZoneName.Capture || (card.isUnit() && concreteCaptors.includes(card.getCaptor())));
    }

    public getCardsForPlayerZones(zone: ZoneFilter, player: Player, game: Game) {
        let cards: Card[] = [];
        switch (zone) {
            case WildcardZoneName.Any:
                // TODO: is this ever a case we should have? this would allow targeting deck, discard, etc.
                throw Error('WildcardZoneName.Any is currently not supported for card selectors');
            case WildcardZoneName.AnyArena:
                cards = player.getArenaCards();
                break;
            case WildcardZoneName.AnyAttackable:
                cards = [].concat(player.getArenaCards());
                cards = cards.concat(player.baseZone.cards);
                break;
            case ZoneName.Capture:
                cards = game.allArenas.getUnitCards().flatMap((card) => card.capturedUnits);
                cards = cards.filter((card) => card.owner === player);
                break;
            default:
                cards = player.getCardsInZone(zone);
                break;
        }

        return cards;
    }

    public canTarget(card: Card, context: TContext, selectedCards: Card[] = []) {
        let controllerProp = this.controller;
        if (typeof controllerProp === 'function') {
            controllerProp = controllerProp(context);
        }

        if (!card) {
            return false;
        }

        if (this.checkTarget && !card.canBeTargeted(context, selectedCards)) {
            return false;
        }
        if (controllerProp === RelativePlayer.Self && card.controller !== context.player) {
            return false;
        }
        if (controllerProp === RelativePlayer.Opponent && card.controller !== context.player.opponent) {
            return false;
        }
        if (!EnumHelpers.cardZoneMatches(card.zoneName, this.zoneFilter) && card.zoneName !== ZoneName.Capture) {
            return false;
        }
        return EnumHelpers.cardTypeMatches(card.type, this.cardTypeFilter) && this.cardConditionsAreSatisfied(card, selectedCards, context);
    }

    private cardConditionsAreSatisfied(card: Card, selectedCards: Card[], context: TContext) {
        const cardConditionPassed = !this.cardCondition || this.cardCondition(card, context);
        const multiSelectConditionPassed = !this.multiSelectCardCondition || this.multiSelectCardCondition(card, selectedCards, context);
        return cardConditionPassed && multiSelectConditionPassed;
    }

    public getAllLegalTargets(context: TContext) {
        return this.findPossibleCards(context).filter((card) => this.canTarget(card, context));
    }

    public hasEnoughSelected(selectedCards: Card[], context: TContext) {
        return this.optional || selectedCards.length > 0;
    }

    public hasEnoughTargets(context: TContext) {
        return this.findPossibleCards(context).some((card) => this.canTarget(card, context));
    }

    public defaultActivePromptTitle(context: TContext) {
        // TODO: figure out a better way to handle cases where we want to override the ability title.
        // The current checks are to account for playing upgrades, exploiting, and using modal card options
        const defaultTitle =
            context.ability?.title && !context.ability.title.startsWith('Play') && !context.ability.title.includes('modal')
                ? context.ability.title
                : this.defaultPromptString(context);
        return defaultTitle + (this.appendToDefaultTitle ? ' ' + this.appendToDefaultTitle : '');
    }

    public defaultPromptString(context: TContext) {
        return 'Choose cards';
    }

    public automaticFireOnSelect(context: TContext) {
        return false;
    }

    public wouldExceedLimit(selectedCards: Card[], card: Card) {
        return false;
    }

    public hasReachedLimit(selectedCards: Card[], context: TContext) {
        return false;
    }

    public hasExceededLimit(selectedCards: Card[], context: TContext) {
        return false;
    }

    public formatSelectParam(cards: Card[]): Card | Card[] {
        return cards;
    }
}
