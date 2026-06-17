export class SwuPgn {
    /**
     * Formats a SET#NUM identifier: uppercases the set and zero-pads the number to 3 digits.
     */
    public static formatSetId(set: string, number: number): string {
        return `${set.toUpperCase()}#${String(number).padStart(3, '0')}`;
    }

    /**
     * Returns "Title, Subtitle" when subtitle is provided, or just "Title".
     */
    public static formatCardName(title: string, subtitle?: string): string {
        if (subtitle) {
            return `${title}, ${subtitle}`;
        }
        return title;
    }
}
