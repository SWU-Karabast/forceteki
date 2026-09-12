import type { IKeywordProperties, KeywordNameOrProperties } from '../../../Interfaces';
import { OngoingEffectValueWrapperBase } from './OngoingEffectValueWrapper';
import { Helpers } from '../../utils/Helpers';
import * as KeywordHelpers from '../../ability/KeywordHelpers';
import type { Card } from '../../card/Card';
import type { Game } from '../../Game';
import type { FormatMessage } from '../../chat/GameChat';

import { registerState } from '../../GameObjectUtils';
import { TextHelper } from '../../utils/TextHelper';

@registerState()
export class GainKeyword extends OngoingEffectValueWrapperBase<IKeywordProperties | IKeywordProperties[]> {
    /**
     * Normalizes a raw keyword name/properties argument (or array of them) into the `IKeywordProperties`
     * shape this class stores, e.g. `'sentinel'` -> `{ keyword: 'sentinel' }`. Identity on nullish input,
     * idempotent on already-normalized input. Extracted so the dynamic wrap path in `DynamicOngoingEffectImpl`
     * can compare a raw `calculate` result against a stored normalized value without re-deriving this logic
     * and risking drift, which would otherwise report a change on every recalculation.
     */
    public static normalizeKeywordProps(keywordProps: KeywordNameOrProperties | KeywordNameOrProperties[]): IKeywordProperties | IKeywordProperties[] {
        if (keywordProps == null) {
            return keywordProps as unknown as IKeywordProperties;
        }

        if (Array.isArray(keywordProps)) {
            return keywordProps.map((keyword) => (typeof keyword === 'string' ? { keyword } : keyword));
        } else if (typeof keywordProps === 'string') {
            return { keyword: keywordProps };
        }

        return keywordProps;
    }

    public constructor(game: Game, keywordProps: KeywordNameOrProperties | KeywordNameOrProperties[]) {
        const effectDescription: FormatMessage = {
            format: 'give {0}',
            args: Helpers.asArray(keywordProps).map((keyword) =>
                TextHelper.keyword(keyword)
            )
        };

        super(game, GainKeyword.normalizeKeywordProps(keywordProps), effectDescription);
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