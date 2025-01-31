import type Player from '../Player';
import { Card } from './Card';
import { CardType } from '../Constants';
import * as Contract from '../utils/Contract';
import { WithDamage } from './propertyMixins/Damage';
import { ActionAbility } from '../ability/ActionAbility';
import type { IActionAbilityProps, IConstantAbilityProps, IEpicActionProps, ITriggeredAbilityProps } from '../../Interfaces';
import { WithStandardAbilitySetup } from './propertyMixins/StandardAbilitySetup';
import { EpicActionLimit } from '../ability/AbilityLimit';
import type TriggeredAbility from '../ability/TriggeredAbility';
import type { InPlayCard } from './baseClasses/InPlayCard';

const BaseCardParent = WithDamage(WithStandardAbilitySetup(Card));

/** A Base card (as in, the card you put in your base zone) */
export class BaseCard extends BaseCardParent {
    private _epicActionAbility: ActionAbility;

    public get epicActionSpent() {
        Contract.assertNotNullLike(this._epicActionAbility, `Attempting to check if epic action for card ${this.internalName} is spent, but no epic action ability is set`);
        return this.epicActionSpentInternal();
    }

    public constructor(owner: Player, cardData: any) {
        super(owner, cardData);
        Contract.assertEqual(this.printedType, CardType.Base);
    }

    public override isBase(): this is BaseCard {
        return true;
    }

    public override initializeForStartZone(): void {
        super.initializeForStartZone();

        this.setDamageEnabled(true);
        this.setActiveAttackEnabled(true);
    }

    public override getActionAbilities(): ActionAbility[] {
        if (this._epicActionAbility) {
            return super.getActionAbilities().concat(this._epicActionAbility);
        }

        return super.getActionAbilities();
    }

    public override canRegisterTriggeredAbilities(): this is InPlayCard | BaseCard {
        return true;
    }

    // TODO TYPE REFACTOR: this method is duplicated
    protected addConstantAbility(properties: IConstantAbilityProps<this>): IConstantAbilityProps<this> {
        const ability = this.createConstantAbility(properties);
        ability.registeredEffects = this.addEffectToEngine(ability);
        this.constantAbilities.push(ability);
        return ability;
    }

    protected setEpicActionAbility(properties: IEpicActionProps<this>): void {
        Contract.assertIsNullLike(this._epicActionAbility, 'Epic action ability already set');

        const propertiesWithLimit: IActionAbilityProps<this> = Object.assign(properties, {
            limit: new EpicActionLimit()
        });

        this._epicActionAbility = new ActionAbility(this.game, this, propertiesWithLimit);
    }

    protected addTriggeredAbility(properties: ITriggeredAbilityProps<this>): TriggeredAbility {
        if (!this.triggeredAbilities) {
            this.triggeredAbilities = [];
        }
        const ability = this.createTriggeredAbility(properties);
        this.triggeredAbilities.push(ability);
        ability.registerEvents();
        return ability;
    }

    public getTriggeredAbilities(): TriggeredAbility[] {
        return this.triggeredAbilities;
    }

    private epicActionSpentInternal(): boolean {
        return this._epicActionAbility.limit.isAtMax(this.owner);
    }

    public override getSummary(activePlayer: Player) {
        return {
            ...super.getSummary(activePlayer),
            epicActionSpent: this.epicActionSpentInternal()
        };
    }
}
