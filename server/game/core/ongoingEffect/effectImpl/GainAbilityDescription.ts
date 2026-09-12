import type { IAbilityPropsWithType, KeywordNameOrProperties } from '../../../Interfaces';
import { AbilityType, EventName, StandardTriggeredAbilityType } from '../../Constants';
import { TextHelper } from '../../utils/TextHelper';

/**
 * Builds the "trigger prefix" for a gained ability (e.g. `On Attack`, `When Defeated`),
 * or `undefined` when the ability has no meaningful trigger label (constant, replacement, etc.).
 */
export function gainedAbilityTriggerLabel(props: IAbilityPropsWithType): string | undefined {
    if (props.type === AbilityType.Action) {
        return 'Action';
    }

    if (props.type !== AbilityType.Triggered || !('when' in props) || !props.when) {
        return undefined;
    }

    const when = props.when as Record<string, unknown>;
    const labels: string[] = [];
    if (when[StandardTriggeredAbilityType.WhenPlayed]) {
        labels.push('When Played');
    }
    if (when[StandardTriggeredAbilityType.WhenPlayedUsingSmuggle]) {
        labels.push(`When Played using ${TextHelper.Smuggle}`);
    }
    if (when[StandardTriggeredAbilityType.OnAttack]) {
        labels.push('On Attack');
    }
    if (when[StandardTriggeredAbilityType.OnDefense]) {
        labels.push('On Defense');
    }
    if (when[StandardTriggeredAbilityType.WhenDefeated]) {
        labels.push('When Defeated');
    }
    if (when[EventName.OnAttackEnd]) {
        labels.push('When Attack Ends');
    }

    return labels.length > 0 ? labels.join('/') : undefined;
}

/**
 * Describes a gained ability for display, combining its trigger label (if any) with its title
 * (e.g. `On Attack: Discard a card from your hand`). Falls back to just the title, or just the
 * trigger label if no title is set.
 */
export function describeGainedAbility(props: IAbilityPropsWithType): string | undefined {
    const label = gainedAbilityTriggerLabel(props);
    const title = typeof props.title === 'string' ? props.title : undefined;

    if (label && title) {
        return `${label}: ${title}`;
    }
    return label ?? title;
}

/** Title for an effect that gives a keyword to an upgrade's attached unit (e.g. "Give Restore 2 to the attached unit"). */
export function giveKeywordToAttachedUnitTitle(keyword: KeywordNameOrProperties): string {
    return `Give ${TextHelper.keyword(keyword)} to the attached unit`;
}

/** Title for an effect that gives an ability to an upgrade's attached unit (e.g. "Give “On Attack: ...” to the attached unit"). */
export function giveAbilityToAttachedUnitTitle(props: IAbilityPropsWithType): string {
    const description = describeGainedAbility(props);
    return description ? `Give “${description}” to the attached unit` : 'Give an ability to the attached unit';
}
