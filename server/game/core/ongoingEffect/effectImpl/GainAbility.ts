import type { IAbilityPropsWithType } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import type { Card } from '../../card/Card';
import { AbilityType } from '../../Constants';
import * as Contract from '../../utils/Contract';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export class GainAbility extends OngoingEffectValueWrapper<IAbilityPropsWithType> {
    public readonly abilityType: AbilityType;
    public readonly properties: IAbilityPropsWithType;

    private abilityIdentifier: string;
    private abilityUuidByTargetCard = new Map<InPlayCard, string>();
    private gainAbilitySource: Card;
    private source: Card;

    public constructor(gainedAbilityProps: IAbilityPropsWithType) {
        super(Object.assign(gainedAbilityProps, { printedAbility: false }));

        this.abilityType = gainedAbilityProps.type;
    }

    public override setContext(context) {
        Contract.assertNotNullLike(context.source);

        if (context.ability?.abilityIdentifier) {
            this.abilityIdentifier = `gained_from_${context.ability.abilityIdentifier}`;
        } else if (context.ability?.isLastingEffect) {
            // TODO BUG: this will cause an error if a card gains two abilities from lasting effects because the abilityIdentifier for each will be the same
            this.abilityIdentifier = 'gained_from_lasting_effect';
        } else if (!this.abilityIdentifier) {
            Contract.fail('GainAbility.setContext() called without a valid context');
        }

        super.setContext(context);

        this.source = this.context.source;
        this.gainAbilitySource = this.source;
    }

    public override apply(target: InPlayCard) {
        Contract.assertNotNullLike(this.gainAbilitySource, 'gainAbility.apply() called before gainAbility.setContext()');
        Contract.assertDoesNotHaveKey(this.abilityUuidByTargetCard, target, `Attempting to apply gain ability effect '${this.abilityIdentifier}' to card ${target.internalName} twice`);

        const properties = Object.assign(this.value, { gainAbilitySource: this.gainAbilitySource, abilityIdentifier: this.abilityIdentifier });

        let gainedAbilityUuid: string;
        switch (properties.type) {
            case AbilityType.Action:
                gainedAbilityUuid = target.addGainedActionAbility(properties);
                break;

            case AbilityType.Constant:
                gainedAbilityUuid = target.addGainedConstantAbility(properties);
                break;

            case AbilityType.Triggered:
                gainedAbilityUuid = target.addGainedTriggeredAbility(properties);
                break;

            case AbilityType.ReplacementEffect:
                gainedAbilityUuid = target.addGainedReplacementEffectAbility(properties);
                break;

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }

        this.abilityUuidByTargetCard.set(target, gainedAbilityUuid);
    }

    public override unapply(target: InPlayCard) {
        Contract.assertHasKey(this.abilityUuidByTargetCard, target, `Attempting to unapply gain ability effect "${this.abilityIdentifier}" from card ${target.internalName} but it is not applied`);

        switch (this.abilityType) {
            case AbilityType.Action:
                target.removeGainedActionAbility(this.abilityUuidByTargetCard.get(target));
                break;

            case AbilityType.Constant:
                target.removeGainedConstantAbility(this.abilityUuidByTargetCard.get(target));
                break;

            case AbilityType.Triggered:
                target.removeGainedTriggeredAbility(this.abilityUuidByTargetCard.get(target));
                break;

            case AbilityType.ReplacementEffect:
                target.removeGainedReplacementEffectAbility(this.abilityUuidByTargetCard.get(target));
                break;

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }

        this.abilityUuidByTargetCard.delete(target);
    }
}
