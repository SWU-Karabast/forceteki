import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class SecretBattleOfPretend extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6215104649',
            internalName: 'secret-battle-of-pretend',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a friendly unit. If you do, for each different aspect it has, exhaust an enemy unit in the same arena.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => {
                const differentAspectCount = new Set(ifYouDoContext.target?.aspects).size;
                return {
                    title: 'For each different aspect it has, exhaust an enemy unit in the same arena',
                    targetResolver: {
                        activePromptTitle: () => `Exhaust ${differentAspectCount} enemy unit in ${ifYouDoContext.target?.zoneName === ZoneName.GroundArena ? 'Ground' : 'Space'} arena`,
                        mode: TargetMode.ExactlyVariable,
                        numCardsFunc: (context) => Math.min(differentAspectCount, context.player.opponent.getArenaUnits({ arena: ifYouDoContext.target?.zoneName }).length),
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        cardCondition: (card) => card.zone === ifYouDoContext.target?.zone,
                        immediateEffect: abilityHelper.immediateEffects.exhaust()
                    }
                };
            }
        });
    }
}