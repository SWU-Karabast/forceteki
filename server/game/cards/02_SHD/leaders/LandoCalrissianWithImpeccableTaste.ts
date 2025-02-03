import AbilityHelper from '../../../AbilityHelper';
import { AbilityContext } from '../../../core/ability/AbilityContext';
import { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, PlayType, RelativePlayer, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { IThenAbilityPropsWithSystems } from '../../../Interfaces';
import { ICardTargetResolver } from '../../../TargetInterfaces';

export default class LandoCalrissianWithImpeccableTaste extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5440730550',
            internalName: 'lando-calrissian#with-impeccable-taste',
        };
    }

    private buildSmuggleCardAbility(): ICardTargetResolver<TriggeredAbilityContext<this>> {
        return {
            cardCondition: (card) => card.hasSomeKeyword(KeywordName.Smuggle),
            controller: RelativePlayer.Self,
            zoneFilter: ZoneName.Resource,
            immediateEffect: AbilityHelper.immediateEffects.playCard({
                playType: PlayType.Smuggle,
                adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 }
            })
        };
    }

    private buildDefeatResourceAbility(): IThenAbilityPropsWithSystems<AbilityContext> {
        return {
            title: 'Defeat a resource you own and control',
            immediateEffect: AbilityHelper.immediateEffects.selectCard({
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Resource,
                cardCondition: (card) => card.owner === this.controller,
                activePromptTitle: 'Defeat a resource you own and control',
                innerSystem: AbilityHelper.immediateEffects.defeat()
            })
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: this.buildSmuggleCardAbility(),
            then: this.buildDefeatResourceAbility()
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addActionAbility({
            title: 'Play a card using Smuggle. It costs 2 less. Defeat a resource you own and control. Use this ability only once each round',
            limit: AbilityHelper.limit.perRound(1),
            targetResolver: this.buildSmuggleCardAbility(),
            then: this.buildDefeatResourceAbility()
        });
    }
}