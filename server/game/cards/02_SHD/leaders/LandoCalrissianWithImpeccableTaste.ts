import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { GameStateChangeRequired, KeywordName, PlayType, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { IThenAbilityPropsWithSystems } from '../../../Interfaces';
import type { ICardTargetResolver } from '../../../TargetInterfaces';

export default class LandoCalrissianWithImpeccableTaste extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5440730550',
            internalName: 'lando-calrissian#with-impeccable-taste',
        };
    }

    private buildSmuggleCardAbility(): ICardTargetResolver<TriggeredAbilityContext<this>> {
        return {
            controller: RelativePlayer.Self,
            zoneFilter: ZoneName.Resource,
            cardCondition: (card) => card.hasSomeKeyword(KeywordName.Smuggle), // This helps prevent a prompt error
            immediateEffect: AbilityHelper.immediateEffects.playCard({
                playType: PlayType.Smuggle,
                playAsType: WildcardCardType.Any,
                adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 }
            })
        };
    }

    private buildDefeatResourceAbility(): IThenAbilityPropsWithSystems<AbilityContext<this>> {
        return {
            title: 'Defeat a resource you own and control',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Resource,
                cardCondition: (card, context) => card.owner === context.source.controller,
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                activePromptTitle: 'Defeat a resource you own and control',
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
            title: 'Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: this.buildSmuggleCardAbility(),
            then: this.buildDefeatResourceAbility()
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addActionAbility({
            title: 'Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control. Use this ability only once each round',
            limit: AbilityHelper.limit.perRound(1),
            targetResolver: this.buildSmuggleCardAbility(),
            then: this.buildDefeatResourceAbility()
        });
    }
}