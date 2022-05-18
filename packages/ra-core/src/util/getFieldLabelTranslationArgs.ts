import inflection from 'inflection';

interface Args {
    label?: string;
    prefix?: string;
    resource?: string;
    resourceFromContext?: string;
    source?: string;
}

type TranslationArguments = [string, any?];

/**
 * Returns an array of arguments to use with the translate function for the label of a field.
 * The label will be the one specified by the label prop or one computed from the resource and source props.
 *
 * Usage:
 *  <span>
 *      {translate(...getFieldLabelTranslationArgs({ label, resource, source }))}
 *  </span>
 *
 * @see useTranslateLabel for a ready-to-use hook
 */
export default (options?: Args): TranslationArguments => {
    if (!options) return [''];

    const { label, prefix, resource, resourceFromContext, source } = options;

    if (typeof label !== 'undefined') return [label, { _: label }];

    if (typeof source === 'undefined') return [''];

    const { sourceWithoutDigits, sourceSuffix } = getSourceParts(source);

    const defaultLabel = inflection.transform(
        sourceSuffix.replace(/\./g, ' '),
        ['underscore', 'humanize']
    );

    if (resource) {
        return [
            `resources.${resource}.fields.${sourceWithoutDigits}`,
            { _: defaultLabel },
        ];
    }

    if (prefix) {
        return [`${prefix}.${sourceWithoutDigits}`, { _: defaultLabel }];
    }

    return [
        `resources.${resourceFromContext}.fields.${sourceWithoutDigits}`,
        { _: defaultLabel },
    ];
};

// source is like 'pictures.0.url'
const getSourceParts = (source: string) => {
    // remove digits, e.g. 'book.authors.2.categories.3.identifier.name' => 'book.authors.categories.identifier.name'
    const sourceWithoutDigits = source.replace(/\.\d+\./g, '.');
    // get final part, e.g. 'book.authors.2.categories.3.identifier.name' => 'identifier.name'
    const matches = source.match(/^.*\.\d+\.(.*)$/);
    const sourceSuffix = matches ? matches[1] : source;
    return { sourceWithoutDigits, sourceSuffix };
};
