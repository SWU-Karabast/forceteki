import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class AATIncinerator extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'aat-incinerator-id',
            internalName: 'aat-incinerator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to each of up to 4 other ground units. If no friendly units were damaged, deal 2 damage to your base',
            targetResolver: ({
                mode: TargetMode.UpTo,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                cardCondition: (card, context) => card !== context.source,
                canChooseNoCards: true,
                numCards: 4,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
            }),
            then: (thenContext) => ({
                title: 'If no friendly units were damaged, deal 2 damage to your base',
                thenCondition: (context) => !thenContext.events.some((event) => event.lastKnownInformation.controller === context.source.controller),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2, target: thenContext.player.base }),
            }),
        });
    }
}

/* title: 'If no friendly units were damaged, deal 2 damage to your base',
                thenCondition: (context) => !thenContext.events.[0 - 3].lastKnownInformation.card.controller((card: Card) => card.controller === context.source.controller),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2, target: thenContext.player.base }), */