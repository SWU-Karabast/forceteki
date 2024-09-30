import { IAbilityPropsWithType } from '../../../Interfaces';
import type { InPlayCard } from '../../card/baseClasses/InPlayCard';
import type { Card } from '../../card/Card';
import { AbilityType } from '../../Constants';
import * as Contract from '../../utils/Contract';
import { OngoingEffectValueWrapper } from './OngoingEffectValueWrapper';

export class GainAbility extends OngoingEffectValueWrapper<IAbilityPropsWithType> {
    public readonly abilityType: AbilityType;
    public readonly properties: IAbilityPropsWithType;

    private abilityIdentifier: string;
    private gainedAbilityForCard = new Map<InPlayCard, string>();
    private source: Card;

    public constructor(gainedAbilityProps: IAbilityPropsWithType) {
        super(Object.assign(gainedAbilityProps, { printedAbility: false }));

        this.abilityType = gainedAbilityProps.type;

        if (this.abilityType === AbilityType.Constant) {
            throw new Error('Gaining constant abilities is not yet implemented');
        }

        // TODO: is there anything in SWU that causes a card to gain a constant ability?
        // if (this.abilityType === AbilityType.Constant && !this.properties.locationFilter) {
        //     this.properties.locationFilter = WildcardLocation.AnyArena;
        //     this.properties.abilityType = AbilityType.Constant;
        // }
    }

    public override setContext(context) {
        Contract.assertNotNullLike(context.source);
        Contract.assertNotNullLike(context.ability);

        super.setContext(context);

        this.abilityIdentifier = `gained_from_${context.ability.abilityIdentifier}`;
        this.source = this.context.source;
    }

    public override apply(target: InPlayCard) {
        Contract.assertNotNullLike(this.context?.source, 'gainAbility.apply() called when this.context.source is not set');

        const properties = Object.assign(this.value, { gainAbilitySource: this.context.source });

        switch (properties.type) {
            case AbilityType.Action:
                target.createActionAbility(properties);
                return;

            case AbilityType.Triggered:
                Contract.assertDoesNotHaveKey(this.gainedAbilityForCard, target, `Attempting to apply gain ability effect "${this.abilityIdentifier}" to card ${target.internalName} twice`);
                this.gainedAbilityForCard.set(target, target.addGainedTriggeredAbility(properties));
                return;

            case AbilityType.Constant:
                // TODO: is there anything in SWU that causes a card to gain a constant ability?
                // this.value = properties;
                // if (EnumHelpers.isArena(target.location)) {
                //     this.value.registeredEffects = [target.addEffectToEngine(this.value)];
                // }
                // return;

                throw new Error('Gaining constant abilities is not yet implemented');

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }
    }

    public override unapply(target: InPlayCard) {
        switch (this.abilityType) {
            case AbilityType.Action:
                // TODO THIS PR
                // target.removeActionAbility(this.value);
                return;

            case AbilityType.Triggered:
                Contract.assertHasKey(this.gainedAbilityForCard, target, `Attempting to unapply gain ability effect "${this.abilityIdentifier}" from card ${target.internalName} but it is not applied`);

                target.removeGainedTriggeredAbility(this.gainedAbilityForCard.get(target));
                this.gainedAbilityForCard.delete(target);

                return;

            case AbilityType.Constant:
                // TODO: is there anything in SWU that causes a card to gain a constant ability?
                // target.removeEffectFromEngine(this.value.registeredEffects[0]);
                // delete this.value.registeredEffects;

                throw new Error('Gaining constant abilities is not yet implemented');

            default:
                Contract.fail(`Unknown ability type: ${this.abilityType}`);
        }
    }
}
