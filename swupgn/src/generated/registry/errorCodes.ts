// GENERATED from schema/ and registry/ — do not edit

export const errorCodes = [
    {
        "code": "not-swupgn",
        "severity": "fatal",
        "condition": "The first line is not a SWU-PGN Game tag."
    },
    {
        "code": "unsupported-major",
        "severity": "fatal",
        "condition": "The major version is not supported."
    },
    {
        "code": "too-large",
        "severity": "fatal",
        "condition": "The input exceeds the size limit."
    },
    {
        "code": "line-too-long",
        "severity": "fatal",
        "condition": "A line exceeds the length limit."
    },
    {
        "code": "too-many-records",
        "severity": "fatal",
        "condition": "The record count, or the number of entities that exist at once, exceeds the limit."
    },
    {
        "code": "too-deep",
        "severity": "fatal",
        "condition": "Nesting exceeds the depth limit."
    },
    {
        "code": "bad-header-line",
        "severity": "fatal",
        "condition": "A header line is not a well-formed tag pair."
    },
    {
        "code": "bad-escape",
        "severity": "fatal",
        "condition": "A header value has an invalid escape."
    },
    {
        "code": "duplicate-tag",
        "severity": "fatal",
        "condition": "A header tag appears twice."
    },
    {
        "code": "missing-tag",
        "severity": "fatal",
        "condition": "A required header tag is missing."
    },
    {
        "code": "bad-count",
        "severity": "fatal",
        "condition": "A count header tag (Rounds, or a present Undos, GameNumber, WriterRevision or WriterErrors) is not base-10 digits within the integer range."
    },
    {
        "code": "duplicate-section",
        "severity": "fatal",
        "condition": "A section appears twice."
    },
    {
        "code": "record-outside-section",
        "severity": "fatal",
        "condition": "A record line is outside any section."
    },
    {
        "code": "bad-json",
        "severity": "fatal",
        "condition": "A line is not valid JSON."
    },
    {
        "code": "duplicate-key",
        "severity": "fatal",
        "condition": "An object has a duplicate key."
    },
    {
        "code": "reserved-key",
        "severity": "fatal",
        "condition": "An object uses a reserved key such as __proto__."
    },
    {
        "code": "schema",
        "severity": "error",
        "condition": "A line does not match its schema."
    },
    {
        "code": "not-object",
        "severity": "error",
        "condition": "A record line is not a JSON object."
    },
    {
        "code": "number-range",
        "severity": "error",
        "condition": "A number is outside its allowed range."
    },
    {
        "code": "card-index",
        "severity": "error",
        "condition": "A CARDS line lacks a string id or a string name."
    },
    {
        "code": "unknown-entity",
        "severity": "error",
        "condition": "A record refers to an entity that does not exist."
    },
    {
        "code": "duplicate-entity",
        "severity": "error",
        "condition": "A create uses an id that already exists."
    },
    {
        "code": "reused-id",
        "severity": "error",
        "condition": "A create uses an id that was retired."
    },
    {
        "code": "parent-rel",
        "severity": "error",
        "condition": "parent and rel are not present together."
    },
    {
        "code": "seq-order",
        "severity": "error",
        "condition": "Step seq values do not count 0, 1, 2, … in file order with no gap."
    },
    {
        "code": "bad-zone",
        "severity": "error",
        "condition": "A zone name is not in the registry."
    },
    {
        "code": "bad-relation",
        "severity": "error",
        "condition": "A relation name is not in the registry."
    },
    {
        "code": "profile",
        "severity": "error",
        "condition": "The file breaks the rules of its Visibility profile."
    },
    {
        "code": "card-not-indexed",
        "severity": "error",
        "condition": "A card id used in the file is missing from CARDS."
    },
    {
        "code": "result-mismatch",
        "severity": "error",
        "condition": "The Result tag disagrees with the game result."
    },
    {
        "code": "writer-errors",
        "severity": "warning",
        "condition": "The writer reported errors while recording."
    },
    {
        "code": "newer-minor",
        "severity": "warning",
        "condition": "The file has a newer minor version."
    },
    {
        "code": "unknown-type",
        "severity": "warning",
        "condition": "A record has an unknown t."
    },
    {
        "code": "unknown-section",
        "severity": "warning",
        "condition": "A section name is unknown."
    },
    {
        "code": "dangling-annotation",
        "severity": "warning",
        "condition": "An annotation refers to a missing step."
    },
    {
        "code": "too-many-issues",
        "severity": "warning",
        "condition": "The issue limit was reached."
    },
    {
        "code": "not-full",
        "severity": "fatal",
        "scope": "api",
        "condition": "redact was given a file whose Visibility is not full."
    }
];
