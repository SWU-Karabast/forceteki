import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Aspect, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class MonMothmaFormingACoalition extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mon-mothma#forming-a-coalition-id',
            internalName: 'mon-mothma#forming-a-coalition',
        };
    }


    private buildMonMothmaAbilityProperties(abilityHelper: IAbilityHelper) {
        return {
            title: 'Ignore the aspect penalty on non-Villainy Official units you play',
            targetController: RelativePlayer.Self,
            ongoingEffect: abilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.Unit,
                match: (card) => card.hasSomeTrait(Trait.Official) && !card.hasSomeAspect(Aspect.Villainy)
            })
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildMonMothmaAbilityProperties(abilityHelper));
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility(this.buildMonMothmaAbilityProperties(abilityHelper));

        registrar.addConstantAbility({
            title: 'Each other friendly Official unit gets +0/+1',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            matchTarget: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Official),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}