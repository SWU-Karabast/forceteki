import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class EzraBridgerItsNowOrNever extends LeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '2102850055',
            internalName: 'ezra-bridger#its-now-or-never',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = abilityHelper.stateWatchers.damageDealtThisPhase();
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'If you dealt 3 or more combat damage to a base, give an Advantage token to a different unit',
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attackingPlayer === context.player
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Give an Advantage token to a different unit',
                contextTitle: (context) => this.getContextTitle(context),
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => {
                        const damage = this.damageDealtThisPhaseWatcher.getDamageDealtToBaseByUnitThisAttack(context.event.attack.attacker, context);
                        return damage >= 3;
                    },
                    onTrue: abilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Give an Advantage token to a different unit',
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card, context) => card !== context.event.attack.attacker,
                        immediateEffect: abilityHelper.immediateEffects.giveAdvantage(),
                    })
                }),
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Advantage token to a different unit',
            contextTitle: (context) => this.getContextTitle(context),
            when: {
                onAttackEnd: (event, context) =>
                    event.attack.attackingPlayer === context.player
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    const damage = this.damageDealtThisPhaseWatcher.getDamageDealtToBaseByUnitThisAttack(context.event.attack.attacker, context);
                    return damage >= 3;
                },
                onTrue: abilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Give an Advantage token to a different unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.event.attack.attacker,
                    immediateEffect: abilityHelper.immediateEffects.giveAdvantage(),
                })
            }),
        });
    }

    private getContextTitle(context: TriggeredAbilityContext): string {
        return `If you dealt 3 or more combat damage to a base, give an Advantage token to a different unit than ${context.event.attack.attacker.title}`;
    }
}