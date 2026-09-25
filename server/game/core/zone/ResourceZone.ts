import { ZoneName, RelativePlayer } from '../Constants';
import type { Player } from '../Player';
import { PlayerZone } from './PlayerZone';
import { Helpers } from '../utils/Helpers.js';
import type { AbilityContext } from '../ability/AbilityContext';
import type { IPlayableCard } from '../card/baseClasses/PlayableOrDeployableCard';
import type { Game } from '../Game';
import { Contract } from '../utils/Contract';

import { registerState } from '../GameObjectUtils';

@registerState()
export class ResourceZone extends PlayerZone<IPlayableCard> {
    public override readonly hiddenForPlayers: RelativePlayer.Opponent;
    public override readonly name: ZoneName.Resource;

    public get exhaustedResourceCount() {
        let count = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].exhausted) {
                count++;
            }
        }
        return count;
    }

    public get exhaustedResources(): readonly IPlayableCard[] {
        return this.cards.filter((card) => card.exhausted);
    }

    public get readyResourceCount() {
        let count = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.cards.length; i++) {
            if (!this.cards[i].exhausted) {
                count++;
            }
        }
        return count;
    }

    public get readyResources(): readonly IPlayableCard[] {
        return this.cards.filter((card) => !card.exhausted);
    }

    public constructor(game: Game, owner: Player) {
        super(game, owner);

        this.hiddenForPlayers = RelativePlayer.Opponent;
        this.name = ZoneName.Resource;
    }

    /**
     * Rearranges ready / exhausted state so that as many of the given resources as possible are in the requested state,
     * keeping the total number of ready and exhausted resources the same. All other resources keep their current state where possible.
     *
     * Players may rearrange their resources at any time up until a specific resource is chosen (rule 1.7.4), so this is used
     * when the player chooses specific resources for an effect where their ready state matters (e.g. defeating ready resources).
     *
     * @param resources The resources to prioritize for the requested state
     * @param exhausted Whether the resources should be exhausted (true) or ready (false)
     */
    public rearrangeResourcesToExhaustState(resources: readonly IPlayableCard[], exhausted: boolean): void {
        const prioritizedResources = new Set(resources);

        Contract.assertTrue(
            Array.from(prioritizedResources).every((card) => this._cards.includes(card)),
            'Attempting to rearrange resources that are not in the resource zone'
        );

        const prioritizedToSwitch = Array.from(prioritizedResources).filter((card) => card.exhausted !== exhausted);
        const othersToSwitch = this._cards.filter((card) => card.exhausted === exhausted && !prioritizedResources.has(card));

        // swap state pairwise so the ready / exhausted counts are preserved
        const swapCount = Math.min(prioritizedToSwitch.length, othersToSwitch.length);
        for (let i = 0; i < swapCount; i++) {
            prioritizedToSwitch[i].exhausted = exhausted;
            othersToSwitch[i].exhausted = !exhausted;
        }
    }

    public rearrangeResourceExhaustState(context: AbilityContext, priorityCondition: (resource: IPlayableCard) => boolean = () => false): void {
        const exhaustCount = this.exhaustedResourceCount;
        // Cards is an accessor and a copy of the array.
        const cards = this._cards.concat();
        cards.forEach((card) => card.exhausted = false);
        Helpers.shuffleArray(cards, context.game.randomGenerator);

        this._cards = cards;

        let exhausted = 0;

        for (let i = 0; i < this._cards.length; i++) {
            if (exhausted >= exhaustCount) {
                break;
            }
            if (priorityCondition(cards[i])) {
                cards[i].exhausted = true;
                exhausted++;
            }
        }

        if (exhausted < exhaustCount) {
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
}
