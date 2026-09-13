import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { GameStateChangeRequired, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { ICardTargetResolver } from '../../../TargetInterfaces';

export default class MazKanataEclecticPirateQueen extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'maz-kanata#eclectic-pirate-queen-id',
            internalName: 'maz-kanata#eclectic-pirate-queen',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: this.playUnitTitle(),
            cost: abilityHelper.costs.exhaustSelf(),
            targetResolver: this.buildPlayUnitTargetResolver(abilityHelper),
            effect: this.playUnitEffect(),
            effectArgs: (context) => [context.target]
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addActionAbility({
            title: this.playUnitTitle(),
            targetResolver: {
                ...this.buildPlayUnitTargetResolver(abilityHelper),
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve
            },
            effect: this.playUnitEffect(),
            effectArgs: (context) => [context.target]
        });
    }

    private playUnitTitle(): string {
        return `Play a ${TextHelper.Trait.Fringe} or ${TextHelper.Trait.Underworld} unit from your hand. It costs ${TextHelper.resource(1)} less. Give a Weakness token to it`;
    }

    private playUnitEffect(): string {
        return 'play {1} from their hand and give a Weakness token to it';
    }

    private buildPlayUnitTargetResolver(abilityHelper: IAbilityHelper): ICardTargetResolver<AbilityContext<this>> {
        return {
            cardTypeFilter: WildcardCardType.Unit,
            zoneFilter: ZoneName.Hand,
            controller: RelativePlayer.Self,
            cardCondition: (card) => card.hasSomeTrait([Trait.Fringe, Trait.Underworld]),
            immediateEffect: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 },
                    playAsType: WildcardCardType.Unit,
                }),
                abilityHelper.immediateEffects.giveWeakness()
            ])
        };
    }
}
