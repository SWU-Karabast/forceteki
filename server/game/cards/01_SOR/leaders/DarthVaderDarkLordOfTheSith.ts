import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, CardType, WildcardCardType } from '../../../core/Constants';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class DarthVaderDarkLordOfTheSith extends LeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '6088773439',
            internalName: 'darth-vader#dark-lord-of-the-sith',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Deal 1 damage to a unit and 1 damage to a base',
            cost: [AbilityHelper.costs.abilityResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolvers: {
                unit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (context) => this.villainyCardPlayedThisPhase(context),
                        onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    })
                },
                base: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (context) => this.villainyCardPlayedThisPhase(context),
                        onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Deal 2 damage to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }

    private villainyCardPlayedThisPhase(context): boolean {
        return this.cardsPlayedThisPhaseWatcher.someCardsPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === context.source.controller &&
            playedCardEntry.card.hasSomeAspect(Aspect.Villainy)
        );
    }
}

DarthVaderDarkLordOfTheSith.implemented = true;
