import OngoingEffect from './OngoingEffect';
import { RelativePlayer, WildcardLocation, WildcardCardType, CardTypeFilter, Location } from '../Constants';
import * as EnumHelpers from '../utils/EnumHelpers';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import Game from '../Game';
import { Card } from '../card/Card';
import { IOngoingEffectProps } from '../../Interfaces';
import { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';

class OngoingCardEffect extends OngoingEffect {
    public targetsSourceOnly: boolean;
    public targetLocationFilter: WildcardLocation;
    public targetCardTypeFilter: CardTypeFilter[];

    public constructor(game: Game, source: Card, properties: IOngoingEffectProps, effect: OngoingEffectImpl<any>) {
        super(game, source, properties, effect);

        if (!properties.matchTarget) {
            // if there are no filters provided, effect only targets the source card
            if (!properties.targetLocationFilter && !properties.targetCardTypeFilter && !properties.targetController) {
                this.targetsSourceOnly = true;
                return;
            }
        }

        this.targetsSourceOnly = false;

        if (!properties.targetLocationFilter) {
            this.targetLocationFilter = properties.sourceLocationFilter === WildcardLocation.Any
                ? WildcardLocation.Any
                : WildcardLocation.AnyArena;
        } else {
            this.targetLocationFilter = properties.targetLocationFilter;
        }

        // TODO: rework getTargets() so that we can provide an array while still not searching all cards in the game every time
        Contract.assertFalse(Array.isArray(properties.targetLocationFilter), 'Target location filter for an effect definition cannot be an array');

        this.targetCardTypeFilter = properties.targetCardTypeFilter ? Helpers.asArray(properties.targetCardTypeFilter) : [WildcardCardType.Unit];
    }

    /** @override */
    public override isValidTarget(target) {
        if (this.targetsSourceOnly) {
            return target === this.context.source;
        }

        if (typeof this.matchTarget !== 'function') {
            if (target === this.matchTarget) {
                // This is a hack to check whether this is a lasting effect
                return true;
            }

            return false;
        }

        return (
            (this.targetController !== RelativePlayer.Self || target.controller === this.source.controller) &&
            (this.targetController !== RelativePlayer.Opponent || target.controller !== this.source.controller) &&
            EnumHelpers.cardLocationMatches(target.location, this.targetLocationFilter) &&
            EnumHelpers.cardTypeMatches(target.type, this.targetCardTypeFilter) &&
            this.matchTarget(target, this.context)
        );
    }

    /** @override */
    public override getTargets() {
        if (this.targetsSourceOnly) {
            return [this.context.source];
        } else if (this.targetLocationFilter === WildcardLocation.Any) {
            return this.game.allCards;
        } else if (EnumHelpers.isArena(this.targetLocationFilter)) {
            return this.game.findAnyCardsInPlay();
        }
        return this.game.allCards;
    }
}

export default OngoingCardEffect;
