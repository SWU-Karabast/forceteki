import { OngoingEffect } from './OngoingEffect';
import type { CardTypeFilter, ZoneFilter, RelativePlayer } from '../Constants';
import { WildcardZoneName, WildcardCardType } from '../Constants';
import * as EnumHelpers from '../utils/EnumHelpers';
import * as Contract from '../utils/Contract';
import * as Helpers from '../utils/Helpers';
import type Game from '../Game';
import type { Card } from '../card/Card';
import type { IOngoingCardEffectProps } from '../../Interfaces';
import type { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';
import type { AbilityContext } from '../ability/AbilityContext';
import type { Player } from '../Player';

export enum AllCardsTargetMode {
    OnlyOwned = 'onlyOwned',
    OwnedOrControlled = 'ownedOrControlled',
}

export interface IOngoingAllCardsForPlayerEffectProps extends Omit<IOngoingCardEffectProps, 'targetZoneFilter'> {
    targetController: RelativePlayer;
    cardTargetMode: AllCardsTargetMode;
}

export class OngoingAllCardsForPlayerEffect extends OngoingEffect<Card> {
    public readonly cardTargetMode: AllCardsTargetMode;
    public readonly player: Player;
    public readonly targetsSourceOnly: boolean;
    public readonly targetZoneFilter: ZoneFilter;
    public readonly targetCardTypeFilter: CardTypeFilter[];
    public readonly targetController: RelativePlayer;

    public declare matchTarget: (target: Card, context: AbilityContext) => boolean;

    public constructor(game: Game, source: Card, properties: IOngoingAllCardsForPlayerEffectProps, effect: OngoingEffectImpl<any>) {
        Contract.assertIsNullLike((properties as any).targetZoneFilter, 'OngoingAllCardsForPlayerEffect does not support the targetZoneFilter property');

        super(game, source, properties, effect);

        this.player = EnumHelpers.asConcretePlayer(properties.targetController, source.controller);
        this.cardTargetMode = properties.cardTargetMode;

        this.targetsSourceOnly = false;
        this.targetZoneFilter = WildcardZoneName.Any;

        this.targetCardTypeFilter = properties.targetCardTypeFilter
            ? Helpers.asArray(properties.targetCardTypeFilter)
            : [WildcardCardType.Any];
    }

    /** @override */
    public override isValidTarget(target: Card) {
        if (this.cardTargetMode === AllCardsTargetMode.OnlyOwned && target.owner !== this.player) {
            return false;
        }

        if (
            this.cardTargetMode === AllCardsTargetMode.OwnedOrControlled &&
            target.owner !== this.player && target.controller !== this.player
        ) {
            return false;
        }

        if (!EnumHelpers.cardTypeMatches(target.type, this.targetCardTypeFilter)) {
            return false;
        }

        return this.matchTarget(target, this.context);
    }

    /** @override */
    public override getTargets() {
        switch (this.cardTargetMode) {
            case AllCardsTargetMode.OnlyOwned:
                return this.game.allCards.filter((card) => card.owner === this.player);
            case AllCardsTargetMode.OwnedOrControlled:
                return this.game.allCards.filter((card) => card.owner === this.player || card.controller === this.player);
            default:
                Contract.fail(`Unknown card target mode: ${this.cardTargetMode}`);
        }
    }
}
