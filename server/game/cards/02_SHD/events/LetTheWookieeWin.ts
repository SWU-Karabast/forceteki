import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class LetTheWookieeWin extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7578472075',
            internalName: 'let-the-wookiee-win',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'An opponent chooses if you ready up to 6 resources or ready a friendly unit. If it’s a Wookiee unit, attack with it. It gets +2/+0 for this attack',
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: RelativePlayer.Opponent,
                choices: (context) => ({
                    [`${context.player.name} readies up to 6 resources`]:
                        AbilityHelper.immediateEffects.readyResources({ amount: 6 }),
                    [`${context.player.name} readies a friendly unit. If it’s a Wookiee unit, they attack with it and it gets +2/+0 for this attack`]:
                        AbilityHelper.immediateEffects.selectCard({
                            controller: RelativePlayer.Self,
                            cardTypeFilter: WildcardCardType.Unit,
                            immediateEffect: AbilityHelper.immediateEffects.sequential([
                                AbilityHelper.immediateEffects.ready(),
                                AbilityHelper.immediateEffects.attack({
                                    attacker: context.target,
                                    attackerCondition: (card) => card.hasSomeTrait(Trait.Wookiee),
                                    attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) }
                                })
                            ])
                        })
                })
            }
        });
    }
}
