import { managerClient } from "@src/managerClient";
import React from "react";
import useSWR from "swr";
import CodeBlock, { Item, RenderHintBaseFN, WidgetsType } from "../CodeBlock";

const wrapRepeatable = (code: string): string => {
  // const lines = code.split("\n").join("\n   ");
  const lines = code.split("\n");

  const commentRegex = /^\/\*/;

  const commentsLines = lines.filter((line) => {
    return commentRegex.test(line);
  });

  const codeLines = lines.filter((line) => {
    return !commentRegex.test(line);
  });

  return `${commentsLines.join("\n")}
{
  slice?.items?.map((item, i) =>
    ${codeLines.join("\n   ")}
  )
}
`.trim();
};

const createDefaultField =
  (tag = "span") =>
  (fieldText: string, useKey?: boolean) =>
    `<${tag} ${useKey ? appendKey(fieldText) : ""}>{ ${fieldText} }</${tag}>`;

const handleDateCode = (fieldText: string, useKey?: boolean): string =>
  `/* import { asDate } from '@prismicio/helpers' */
<span ${
    useKey ? appendKey(fieldText) : ""
  }>{ asDate(${fieldText}).toString() }</span>
`;

const handleLinkCode = (fieldText: string, useKey?: boolean): string =>
  `/* import { PrismicLink } from '@prismicio/react' */
<PrismicLink ${
    useKey ? appendKey(fieldText) : ""
  } field={${fieldText}}>My Link</PrismicLink>
`;

const handleDocumentLinkCode = (fieldText: string, useKey?: boolean): string =>
  `/* import { PrismicLink } from '@prismicio/react' */
<PrismicLink ${
    useKey ? appendKey(fieldText) : ""
  } document={${fieldText}}>My Link</PrismicLink>
`;

const handleEmbedCode = (fieldText: string, useKey?: boolean): string =>
  `// you might want to use a lib here (eg. react-oembed-container)
<div ${
    useKey ? appendKey(fieldText) : ""
  } dangerouslySetInnerHTML={{ __html: ${fieldText}.html }} />
`;

const appendKey = (id: string): string => `key={\`${id}-\${i}\`}`;

const codeByWidgetType = (
  Widgets: WidgetsType
): Record<
  string,
  (fieldText: string, useKey?: boolean | undefined) => string
> => ({
  [Widgets.ContentRelationship?.CUSTOM_NAME]: (
    fieldText: string,
    useKey?: boolean
  ) => handleDocumentLinkCode(fieldText, useKey),

  [Widgets.LinkToMedia?.CUSTOM_NAME]: (fieldText: string, useKey?: boolean) =>
    handleLinkCode(fieldText, useKey),

  [Widgets.UID?.TYPE_NAME]: (fieldText: string) =>
    `<span>{{ ${fieldText} }}</span>`,

  [Widgets.StructuredText?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `/* import { PrismicRichText } from '@prismicio/react' */
<PrismicRichText field={${fieldText}} ${
      useKey ? appendKey("rich-text") : ""
    }/>`,

  [Widgets.Image?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `<img src={${fieldText}.url} alt={${fieldText}.alt} ${
      useKey ? appendKey("img") : ""
    }/>`,

  [Widgets.Link?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    handleLinkCode(fieldText, useKey),

  [Widgets.Select?.TYPE_NAME]: createDefaultField(),
  [Widgets.Boolean?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `<span ${
      useKey ? appendKey("bool") : ""
    }> { ${fieldText} ? 'true' : 'false' }</span>`,

  [Widgets.Date?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    handleDateCode(fieldText, useKey),

  [Widgets.Timestamp?.TYPE_NAME]: createDefaultField(),

  [Widgets.Embed?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    handleEmbedCode(fieldText, useKey),

  [Widgets.Number?.TYPE_NAME]: createDefaultField(),

  [Widgets.GeoPoint?.TYPE_NAME]: createDefaultField(),

  [Widgets.Color?.TYPE_NAME]: (fieldText: string, useKey?: boolean) =>
    `<span ${
      useKey ? appendKey("color") : ""
    } style={{ color: ${fieldText} }}>Some Text</span>`,

  [Widgets.Text?.TYPE_NAME]: createDefaultField(),
});

const toReact: React.FC<{
  Widgets: WidgetsType;
  item: Item;
  typeName: string;
  renderHintBase: RenderHintBaseFN;
  isRepeatable: boolean;
}> = ({ Widgets, item, typeName, renderHintBase, isRepeatable }) => {
  // TODO: Call `swr`'s global `mutate` function when something changes to clear the cache.
  const { data, error, isValidating } = useSWR("foo.data.bar", async () => {
    return await managerClient.snippets.readSnippets({
      fieldPath: ["foo", "data", "bar"],
      model: { type: "Image" },
      rootModel: {},
      rootModelType: "Slice",
    });
  });
  const snippets = data?.snippets || [];

  if (data == null && isValidating) {
    return null;
  }

  const hintBase = renderHintBase({ item });

  const maybeCodeRenderer = codeByWidgetType(Widgets)[typeName];
  const code = maybeCodeRenderer ? maybeCodeRenderer(hintBase) : "";
  const withRepeat = isRepeatable ? wrapRepeatable(code) : code;

  return <CodeBlock code={snippets[0].code} lang={snippets[0].language} />;
};

export default toReact;
