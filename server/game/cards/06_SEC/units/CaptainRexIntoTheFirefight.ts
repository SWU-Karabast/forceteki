import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class CaptainRexIntoTheFirefight extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    protected override getImplementationId() {
        return {
            id: '1768040578',
            internalName: 'captain-rex#into-the-firefight',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Give this unit and an enemy unit ${TextHelper.Sentinel} for this phase`,
            when: {
                whenPlayed: true,
                onAttackEnd: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.event.name !== EventName.OnAttackEnd ||
                    AttackHelpers.attackerSurvived(context.event.attack, this.cardsDefeatedThisPhaseWatcher),
                onTrue: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    }),
                    AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                        })
                    })
                ])
            })
        });
    }
}