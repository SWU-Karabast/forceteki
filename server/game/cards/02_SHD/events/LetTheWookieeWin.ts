import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class LetTheWookieeWin extends EventCard {
    protected override getImplementationId () {
        return {
            id: '7578472075',
            internalName: 'let-the-wookiee-win',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Your opponent chooses an effect',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 1,
                choosingPlayer: RelativePlayer.Opponent,
                choices: {
                    ['Your opponent readies up to 6 resources']:
                        AbilityHelper.immediateEffects.readyResources({ amount: 6 }),
                    [`Your opponent readies a unit they control. If it's a ${TextHelper.Trait.Wookiee}, they attack with it and it gets +2/+0 for this attack`]:
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: `Ready a friendly unit. If it's a ${TextHelper.Trait.Wookiee}, attack with it`,
                            controller: RelativePlayer.Self,
                            cardTypeFilter: WildcardCardType.Unit,
                            immediateEffect: AbilityHelper.immediateEffects.sequential([
                                AbilityHelper.immediateEffects.ready(),
                                AbilityHelper.immediateEffects.attack({
                                    attackerCondition: (card) => card.hasSomeTrait(Trait.Wookiee),
                                    attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) }
                                })
                            ])
                        })
                }
            })
        });
    }
}
