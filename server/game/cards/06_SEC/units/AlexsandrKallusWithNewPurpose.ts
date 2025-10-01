import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, TargetMode, ZoneName } from '../../../core/Constants';

export default class AlexsandrKallusWithNewPurpose extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'alexsandr-kallus#with-new-purpose-id',
            internalName: 'alexsandr-kallus#with-new-purpose',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you have the initiative, each other friendly unique unit gains Raid 2',
            condition: (context) => context.player.hasInitiative(),
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.unique && card.controller === context.player,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });

        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to each of up to 3 ground units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
