import type { AbilityContext } from '../core/ability/AbilityContext';
import type { PlayCardContext, IPlayCardActionProperties } from '../core/ability/PlayCardAction';
import { PlayCardAction } from '../core/ability/PlayCardAction';
import type { Card } from '../core/card/Card';
import type { UpgradeCard } from '../core/card/UpgradeCard';
import { AbilityRestriction, PlayType, RelativePlayer } from '../core/Constants';
import type Game from '../core/Game';
import * as Contract from '../core/utils/Contract';
import { AttachUpgradeSystem } from '../gameSystems/AttachUpgradeSystem';
import { attachUpgrade } from '../gameSystems/GameSystemLibrary';

export class PlayUpgradeAction extends PlayCardAction {
    // we pass in a targetResolver holding the attachUpgrade system so that the action will be blocked if there are no valid targets
    public constructor(game: Game, card: Card, properties: IPlayCardActionProperties) {
        super(game, card,
            {
                ...properties,
                targetResolver: {
                    immediateEffect: attachUpgrade<AbilityContext<UpgradeCard>>((context) => ({ upgrade: context.source }))
                }
            }
        );
    }

    public override executeHandler(context: PlayCardContext) {
        Contract.assertTrue(context.source.isUpgrade());

        const events = [
            new AttachUpgradeSystem({
                upgrade: context.source,
                target: context.target,
                newController: RelativePlayer.Self
            }).generateEvent(context),
            this.generateOnPlayEvent(context, { attachTarget: context.target })
        ];

        if (context.playType === PlayType.Smuggle) {
            this.addSmuggleEvent(events, context);
        }

        context.game.openEventWindow(events);
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new PlayUpgradeAction(this.game, this.card, { ...this.createdWithProperties, ...overrideProperties });
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.player.hasRestriction(AbilityRestriction.PlayUpgrade, context) ||
            context.player.hasRestriction(AbilityRestriction.PutIntoPlay, context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }

    public override displayMessage(context: AbilityContext) {
        context.game.addMessage('{0} plays {1}, attaching it to {2}', context.player, context.source, context.target);
    }
}
