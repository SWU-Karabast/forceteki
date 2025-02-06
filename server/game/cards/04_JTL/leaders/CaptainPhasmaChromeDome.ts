import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, Trait, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class CaptainPhasmaChromeDome extends LeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3132453342',
            internalName: 'captain-phasma#chrome-dome',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Deal 1 damage to a base',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.firstOrderCardPlayedThisPhase(context),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'If you played a First Order card this phase, deal 1 damage to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.firstOrderCardPlayedThisPhase(context),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                }),
            },
            ifYouDo: {
                title: 'Deal 1 damage to a base',
                targetResolver: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }

    private firstOrderCardPlayedThisPhase(context): boolean {
        return this.cardsPlayedThisPhaseWatcher.someCardPlayed((playedCardEntry) =>
            playedCardEntry.playedBy === context.source.controller &&
            playedCardEntry.card.hasSomeTrait(Trait.FirstOrder)
        );
    }
}
