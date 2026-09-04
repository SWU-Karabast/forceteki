import { OngoingEffect } from './OngoingEffect';
import type { CardTypeFilter, ZoneFilter, RelativePlayer } from '../Constants';
import { WildcardZoneName, WildcardCardType } from '../Constants';
import { EnumHelpers } from '../utils/EnumHelpers';
import { Contract } from '../utils/Contract';
import { Helpers } from '../utils/Helpers';
import type { Game } from '../Game';
import type { Card } from '../card/Card';
import type { IOngoingCardEffectProps } from '../../Interfaces';
import type { OngoingEffectImpl } from './effectImpl/OngoingEffectImpl';
import type { AbilityContext } from '../ability/AbilityContext';
import type { Player } from '../Player';
import { registerState } from '../GameObjectUtils';

export enum AllCardsTargetMode {
    OnlyOwned = 'onlyOwned',
    OnlyControlled = 'onlyControlled',
    OwnedOrControlled = 'ownedOrControlled',
}

export interface IOngoingAllCardsForPlayerEffectProps extends Omit<IOngoingCardEffectProps, 'targetZoneFilter'> {
    targetController: RelativePlayer;
    cardTargetMode: AllCardsTargetMode;
}

@registerState()
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
        if (!this.matchesCardTargetMode(target)) {
            return false;
        }

        if (!EnumHelpers.cardTypeMatches(target.type, this.targetCardTypeFilter)) {
            return false;
        }

        return this.matchTarget(target, this.context);
    }

    /** @override */
    public override getTargets() {
        return this.game.allCards.filter((card) => this.matchesCardTargetMode(card));
    }

    /** Whether the card's owner / controller relationship to {@link player} matches the configured {@link cardTargetMode} */
    private matchesCardTargetMode(card: Card): boolean {
        switch (this.cardTargetMode) {
            case AllCardsTargetMode.OnlyOwned:
                return card.owner === this.player;
            case AllCardsTargetMode.OnlyControlled:
                return card.controller === this.player;
            case AllCardsTargetMode.OwnedOrControlled:
                return card.owner === this.player || card.controller === this.player;
            default:
                Contract.fail(`Unknown card target mode: ${this.cardTargetMode}`);
        }
    }
}
