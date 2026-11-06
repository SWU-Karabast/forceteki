import type { IKeywordProperties, KeywordNameOrProperties, INumericKeywordProperties } from '../../../Interfaces';
import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { Helpers } from '../../utils/Helpers';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import type { Card } from '../../card/Card';
import type { Game } from '../../Game';
import type { FormatMessage } from '../../chat/GameChat';

import { registerState } from '../../GameObjectUtils';
import { TextHelper } from '../../utils/TextHelper';

/**
 * A numeric keyword (Raid, Restore, Exploit) with an amount of 0 or less is not gained at all, e.g. "gains Raid 1 for each
 * damaged enemy unit" while no enemy unit is damaged: the unit does not have Raid, instead of having a "Raid 0".
 */
function isGained(props: IKeywordProperties): boolean {
    return !(KeywordHelpers.isNumericType[props.keyword] && (props as INumericKeywordProperties).amount <= 0);
}

@registerState()
export class GainKeyword extends OngoingEffectValueWrapperBase<IKeywordProperties | IKeywordProperties[]> {
    public constructor(game: Game, keywordProps: KeywordNameOrProperties | KeywordNameOrProperties[]) {
        const effectDescription: FormatMessage = {
            format: 'give {0}',
            args: Helpers.asArray(keywordProps).map((keyword) =>
                TextHelper.keyword(keyword)
            )
        };

        if (Array.isArray(keywordProps)) {
            super(game, keywordProps.map((keyword) => (typeof keyword === 'string' ? { keyword } : keyword)).filter(isGained), effectDescription);
        } else if (typeof keywordProps === 'string') {
            super(game, { keyword: keywordProps }, effectDescription);
        } else {
            super(game, isGained(keywordProps) ? keywordProps : [], effectDescription);
        }
    }

    public override apply(target: Card): void {
        this.refreshWhileInPlayKeywordAbilityEffects(target);
    }

    public override unapply(target: Card): void {
        this.refreshWhileInPlayKeywordAbilityEffects(target);
    }

    private refreshWhileInPlayKeywordAbilityEffects(target: Card): void {
        if (!target.isUnit() || !target.isInPlay()) {
            return;
        }

        const keywordProps = Helpers.asArray(this.getValue());

        if (keywordProps.some((props) => KeywordHelpers.hasWhileInPlayAbility[props.keyword])) {
            target.refreshWhileInPlayKeywordAbilityEffects();
        }
    }
}