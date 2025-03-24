import { ZoneName, RelativePlayer, KeywordName } from '../Constants';
import type Player from '../Player';
import { PlayerZone } from './PlayerZone';
import * as Helpers from '../utils/Helpers.js';
import type { AbilityContext } from '../ability/AbilityContext';
import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import type Game from '../Game';

export class ResourceZone extends PlayerZone<IPlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: ZoneName.Resource;

    public get exhaustedResourceCount() {
        return this.exhaustedResources.length;
    }

    public get exhaustedResources() {
        return this.cards.filter((card) => card.exhausted);
    }

    public get readyResourceCount() {
        return this.readyResources.length;
    }

    public get readyResources() {
        return this.cards.filter((card) => !card.exhausted);
    }

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = RelativePlayer.Opponent;
        this.name = ZoneName.Resource;
    }

    public rearrangeResourceExhaustState(context: AbilityContext, prioritizeSmuggle: boolean = false): void {
        const exhaustCount = this.exhaustedResourceCount;
        // Cards is an accessor and a copy of the array.
        let cards = this.cards;
        this.cards.forEach((card) => card.exhausted = false);
        Helpers.shuffleArray(this.state.cards, context.game.randomGenerator);

        // Reacquire cards array in new, shuffled order.
        cards = this.cards;

        let exhausted = 0;

        if (prioritizeSmuggle) {
            for (let i = 0; i < exhaustCount; i++) {
                if (cards[i].hasSomeKeyword(KeywordName.Smuggle)) {
                    cards[i].exhausted = true;
                    exhausted++;
                }
            }
        }
        for (let i = 0; i < exhaustCount; i++) {
            if (cards[i].exhausted === false) {
                cards[i].exhausted = true;
                exhausted++;
            }
            if (exhausted === exhaustCount) {
                break;
            }
        }
    }
}
