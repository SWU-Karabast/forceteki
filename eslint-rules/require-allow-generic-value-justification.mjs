/**
 * P3-PB1 (AC9): `stateValue({ allowGenericValue: true })` is a full compile-time bypass of the
 * Map/Set/Array rejection bare `stateValue()` otherwise enforces (see `GameObjectUtils.ts`'s `stateValue`
 * doc comment) - TypeScript cannot narrow it to "only when the field's type turns out non-collection".
 * Introducing a *new* use of this escape hatch must be a deliberate, reviewable act rather than a silent
 * one: this rule requires an `allowGenericValue-justified:` comment, with a non-trivial explanation,
 * immediately preceding the decorated accessor (or its decorator line).
 *
 * P3-PB1-fix (PB1-R1): the original version of this rule only matched an inline `{ allowGenericValue: true }`
 * object-literal argument, so `const opts = { allowGenericValue: true }; @stateValue(opts)` (or any other
 * indirection - a function call, a spread, an imported constant) compiled clean and linted clean with zero
 * justification anywhere - a complete, reproduced defeat of AC9's guard (see review_implreview1.md PB1-R1).
 * `stateValue()`'s only overload that accepts *any* argument at all is the `{ allowGenericValue: true }`
 * escape hatch (its other overload is strictly nullary - see `GameObjectUtils.ts`), so this rule now flags
 * every `stateValue(...)` call site that has a non-empty argument list, regardless of the argument's AST
 * shape, rather than pattern-matching the shape of that one argument. This closes the indirection gap
 * without typed linting (resolving the argument through the type checker to confirm it structurally equals
 * `{ allowGenericValue: true }` even through aliases) at the cost of only being able to say "an argument was
 * passed", not "the argument sets allowGenericValue to true" - given the overload signatures that distinction
 * doesn't currently exist, so this cost is free today. It stops being free only if a future overload adds a
 * second, differently-shaped argument to `stateValue()`; whoever does that must revisit this rule.
 *
 * Known, accepted residual gap this rule does NOT close (also called out in PB1-R1): a field concretely typed
 * as `Map`/`Set`/`Array` that goes through `@stateValue({ allowGenericValue: true })` still compiles and now
 * requires a justification comment, but neither this rule nor the type checker verifies the *content* of that
 * justification (e.g. that the field's type genuinely cannot be proven non-collection at its declaration
 * site, as opposed to a human writing a plausible-sounding comment to bypass `stateMap`/`stateSet`/
 * `stateArray` on a field that is, in fact, concretely a collection type). Catching that requires typed
 * linting - resolving the accessor's declared type through the TypeScript type checker and structurally
 * checking it against `Map`/`Set`/`Array` - which is materially more infrastructure (a typed ESLint config,
 * i.e. `parserOptions.project`, is not currently wired into this repo's flat config) than this AST-only rule.
 * That is a deliberate scope line, not an oversight: this rule guarantees the escape hatch cannot be used
 * *silently*; it does not, and cannot without that infrastructure, guarantee every justification is *honest*.
 * A human reviewer reading the required comment against the field's declared type remains this unit's
 * defense for that residual case.
 *
 * P3-PB1-fix2 (PB1-D1): fix-cycle-1's `expression.callee.name !== 'stateValue'` check answers "does this call
 * site spell the literal identifier `stateValue`?" - a textual question, not "is this a call to the
 * `stateValue` decorator exported by `GameObjectUtils`?". Four shapes answered the textual question "no"
 * while still reaching the real escape hatch and were reproduced lint-clean, zero-justification, against the
 * fix-cycle-1 rule (see review_implreview2.md PB1-D1): an aliased import (`import { stateValue as sv }`), a
 * namespace import (`import * as GOU from ...; @GOU.stateValue(...)`), a decorator-factory wrapper function,
 * and a variable-bound decorator (`const dec = stateValue(...); @dec`). The rule now resolves the callee (and,
 * for a bare decorator identifier, the variable it is bound to) through ESLint's scope analysis back to its
 * declaration - an `ImportSpecifier`/`ImportNamespaceSpecifier` binding whose source module path ends in
 * `GameObjectUtils`, or a `const`/`let` initializer that is itself such a call - before checking the name.
 * This is the same technique (`sourceCode.getScope` + manual scope-chain variable lookup, in place of
 * `eslint-utils`' `ReferenceTracker`, which is not a direct dependency of this repo).
 *
 * P3-PB1-fix3 (PB1-N1/PB1-N2, found by review round 3 probing this fix's own edges): two further shapes
 * reached the real escape hatch lint-clean against the fix-cycle-2 rule. (N1) `isGameObjectUtilsSource` did an
 * exact `endsWith('GameObjectUtils')` match with no extension normalization, so
 * `import { stateValue } from './GameObjectUtils.js'` didn't match - not a contrived shape, since 22 files
 * under `server/game/**` already use this relative-import-with-extension style for ordinary value imports
 * (e.g. `server/game/AbilityHelper.ts`). Fixed by stripping a trailing `.js`/`.mjs`/`.cjs`/`.ts` extension
 * before the suffix check. (N2) the `Identifier` branch of `resolveStateValueCall`/`calleeIsStateValue` only
 * followed a plain `VariableDeclarator` initializer or a `Namespace.stateValue(...)` member access, not
 * `const { stateValue } = Namespace` destructured off a namespace-import binding. Fixed by
 * `isStateValueNamespaceDestructuringBinding`, which matches the destructured property's *source* key (so a
 * rename, `const { stateValue: sv } = Namespace`, still resolves) back through the namespace binding.
 *
 * State precisely, not generally: the shapes this rule closes as of fix3 are (a) the bare local identifier
 * bound by a named import, (b) that import aliased, (c) `Namespace.stateValue(...)` member access on a
 * namespace import, (d) `const { stateValue } = Namespace` destructured off a namespace import (aliased or
 * not), (e) a `const`/`let`-bound decorator reference chaining to any of the above, and (f) all of the above
 * through a relative import path carrying a trailing `.js`/`.mjs`/`.cjs`/`.ts` extension. Three gaps remain
 * disclosed and NOT closed, each requiring materially more infrastructure than this AST-only, single-file
 * rule affords:
 *   1. **Wrapper-function indirection** - an arbitrary function that itself calls and returns
 *      `stateValue({ allowGenericValue: true })`, e.g.
 *      `function withGeneric() { return stateValue({ allowGenericValue: true }); } @withGeneric() accessor ...`.
 *      Closing this needs call-graph/data-flow analysis approaching the cost of full type-checking.
 *   2. **Re-export barrels** - `export { stateValue } from './GameObjectUtils'` in a proxy module, consumed via
 *      `import { stateValue } from './proxy'`. This rule only inspects the importing file's own import
 *      declaration, never a second module's `export ... from` re-export chain; closing it needs cross-file
 *      resolution of comparable cost to the wrapper-function gap above.
 *   3. **Justification honesty** - the rule forces a justification comment to exist but cannot verify its
 *      content against the field's actual declared type; a concretely `Map`/`Set`/`Array`-typed field can
 *      still carry this escape hatch and a plausible-sounding comment and pass every automated check. Needs
 *      typed linting (`parserOptions.project`, not currently wired into this repo's flat config).
 * A human reviewer checking new decorator-factory functions, re-export barrels, and justification comments
 * against the field's declared type remains the defense for all three. Do not describe this rule's coverage
 * as "general" or as making these indirections "unable to bypass it silently" - say which shapes, from the
 * list above, are actually closed.
 */

const JUSTIFICATION_MARKER = 'allowGenericValue-justified:';
const MIN_JUSTIFICATION_LENGTH = 10;
const MAX_RESOLUTION_DEPTH = 5;

function isGameObjectUtilsSource(sourceValue) {
    if (typeof sourceValue !== 'string') {
        return false;
    }
    // Strip a trailing module extension (PB1-N1) before the suffix check, so
    // `import { stateValue } from './GameObjectUtils.js'` - an ordinary relative-import style already in use
    // elsewhere in this codebase for plain value imports (e.g. server/game/AbilityHelper.ts), not a contrived
    // adversarial shape - is recognized the same as the extension-less form.
    return sourceValue.replace(/\.(m|c)?[jt]s$/, '').endsWith('GameObjectUtils');
}

function findVariableInScope(scope, name) {
    let currentScope = scope;
    while (currentScope) {
        const variable = currentScope.variables.find((candidate) => candidate.name === name);
        if (variable) {
            return variable;
        }
        currentScope = currentScope.upper;
    }
    return null;
}

// True when `variable` is bound by `import { stateValue [as alias] } from '.../GameObjectUtils'`
// (aliased or not - PB1-D1 case 1).
function isStateValueNamedImportBinding(variable) {
    if (!variable) {
        return false;
    }
    return variable.defs.some((def) => {
        if (def.type !== 'ImportBinding' || def.node.type !== 'ImportSpecifier') {
            return false;
        }
        return def.node.imported.name === 'stateValue' && isGameObjectUtilsSource(def.parent?.source?.value);
    });
}

// True when `variable` is bound by `import * as Namespace from '.../GameObjectUtils'`
// (PB1-D1 case 2's object half).
function isGameObjectUtilsNamespaceImportBinding(variable) {
    if (!variable) {
        return false;
    }
    return variable.defs.some((def) => {
        return def.type === 'ImportBinding' &&
            def.node.type === 'ImportNamespaceSpecifier' &&
            isGameObjectUtilsSource(def.parent?.source?.value);
    });
}

// True when `variable` is bound by `const { stateValue } = Namespace` (optionally renamed, e.g.
// `const { stateValue: sv } = Namespace`) where `Namespace` itself resolves to a
// `import * as Namespace from '.../GameObjectUtils'` binding (PB1-N2) - the destructuring counterpart to
// the already-handled `Namespace.stateValue(...)` member-access shape.
function isStateValueNamespaceDestructuringBinding(variable, scope) {
    if (!variable) {
        return false;
    }
    return variable.defs.some((def) => {
        if (def.type !== 'Variable' || def.node.type !== 'VariableDeclarator' ||
            def.node.id.type !== 'ObjectPattern' || !def.node.init || def.node.init.type !== 'Identifier') {
            return false;
        }

        // `def.name` is the destructured local Identifier this binding was created for; find the matching
        // ObjectPattern property (handles both shorthand `{ stateValue }` and renamed `{ stateValue: sv }`)
        // and confirm its *source* key (not the local alias) is literally `stateValue`.
        const matchingProperty = def.node.id.properties.find((property) => {
            return property.type === 'Property' && property.value === def.name;
        });
        const sourceKeyIsStateValue = matchingProperty?.key.type === 'Identifier' &&
            !matchingProperty.computed && matchingProperty.key.name === 'stateValue';
        if (!sourceKeyIsStateValue) {
            return false;
        }

        return isGameObjectUtilsNamespaceImportBinding(findVariableInScope(scope, def.node.init.name));
    });
}

// Resolves whether `calleeNode` (the callee of a CallExpression) ultimately refers to the real
// `stateValue` export of GameObjectUtils, following import aliasing and namespace-member access.
// Does NOT follow into arbitrary function bodies (PB1-D1 case 3 is a disclosed, out-of-scope residual).
function calleeIsStateValue(calleeNode, scope) {
    if (!calleeNode) {
        return false;
    }

    if (calleeNode.type === 'Identifier') {
        const variable = findVariableInScope(scope, calleeNode.name);
        return isStateValueNamedImportBinding(variable) ||
            isStateValueNamespaceDestructuringBinding(variable, scope);
    }

    if (calleeNode.type === 'MemberExpression' && !calleeNode.computed &&
        calleeNode.property.type === 'Identifier' && calleeNode.property.name === 'stateValue' &&
        calleeNode.object.type === 'Identifier') {
        return isGameObjectUtilsNamespaceImportBinding(findVariableInScope(scope, calleeNode.object.name));
    }

    return false;
}

// Resolves `expression` down to the CallExpression that actually invokes `stateValue`, following a chain
// of bare-identifier decorator bindings (`const dec = stateValue(...); @dec` - PB1-D1 case 4) but not into
// function bodies. Returns the resolved CallExpression node, or null if this isn't (traceably) a
// `stateValue` call.
function resolveStateValueCall(expression, scope, depth = 0) {
    if (!expression || depth > MAX_RESOLUTION_DEPTH) {
        return null;
    }

    if (expression.type === 'CallExpression') {
        return calleeIsStateValue(expression.callee, scope) ? expression : null;
    }

    if (expression.type === 'Identifier') {
        const variable = findVariableInScope(scope, expression.name);
        if (!variable) {
            return null;
        }
        for (const def of variable.defs) {
            if (def.type === 'Variable' && def.node.type === 'VariableDeclarator' && def.node.init) {
                const resolved = resolveStateValueCall(def.node.init, scope, depth + 1);
                if (resolved) {
                    return resolved;
                }
            }
        }
        return null;
    }

    return null;
}

function isAllowGenericValueDecorator(decorator, context) {
    if (decorator?.type !== 'Decorator') {
        return false;
    }

    const scope = context.sourceCode.getScope(decorator);
    const call = resolveStateValueCall(decorator.expression, scope);
    if (!call) {
        return false;
    }

    // Any argument at all only ever means the { allowGenericValue: true } overload - the other overload is
    // strictly nullary (see GameObjectUtils.ts). Flag on argument presence rather than pattern-matching the
    // argument's shape, so aliasing/wrapping the options object cannot defeat this check (PB1-R1).
    return call.arguments.length > 0;
}

function hasSufficientJustification(comments) {
    return comments.some((comment) => {
        const markerIndex = comment.value.indexOf(JUSTIFICATION_MARKER);
        if (markerIndex === -1) {
            return false;
        }

        const explanation = comment.value.slice(markerIndex + JUSTIFICATION_MARKER.length)
            .trim();
        return explanation.length >= MIN_JUSTIFICATION_LENGTH;
    });
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
    meta: {
        type: 'problem',
        docs: {
            description: 'Require an allowGenericValue-justified: comment on every @stateValue({ allowGenericValue: true }) use site, so a new use of this compile-time-bypass escape hatch is a deliberate, reviewable act.',
        },
        messages: {
            requireJustification: '@stateValue({ allowGenericValue: true }) bypasses the Map/Set/Array compile-time check entirely. Add a comment directly above this accessor starting with "allowGenericValue-justified:" explaining why this field\'s declared type cannot be proven non-collection at its declaration site (e.g. an unresolved class type parameter).',
        },
        schema: [],
    },
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            AccessorProperty(node) {
                const decorator = node.decorators?.find((candidate) => isAllowGenericValueDecorator(candidate, context));
                if (!decorator) {
                    return;
                }

                const decoratorComments = sourceCode.getCommentsBefore(decorator);
                const nodeComments = sourceCode.getCommentsBefore(node);

                if (hasSufficientJustification(decoratorComments) || hasSufficientJustification(nodeComments)) {
                    return;
                }

                context.report({
                    node: decorator,
                    messageId: 'requireJustification',
                });
            },
        };
    },
};
