import AbilityHelper from '../../../AbilityHelper';
import { IActionAbilityProps, IEpicActionProps } from '../../../Interfaces';
import { CardActionAbility } from '../../ability/CardActionAbility';
import Card from '../Card';
import { CardConstructor } from '../NewCard';

export function EpicAction<TBaseClass extends CardConstructor>(BaseClass: TBaseClass) {
    return class WithEpicAction extends BaseClass {
        public addEpicActionAbility(properties: IEpicActionProps<this>): void {
            const propertiesWithLimit: IActionAbilityProps<this> = Object.assign(properties, {
                limit: AbilityHelper.limit.perGame(1),
            });

            this.actions.push(new CardActionAbility(this.game, this.generateOriginalCard(), propertiesWithLimit));
        }
    };
}